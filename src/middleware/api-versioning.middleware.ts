import {Next, Provider, inject} from '@loopback/core';
import {Middleware, MiddlewareContext} from '@loopback/rest';

export interface ApiVersioningOptions {
  supportedVersions?: string[];
  headerName?: string;
}

export class ApiVersioningMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('versioning.options', {optional: true})
    private opts: ApiVersioningOptions = {headerName: 'X-API-Version'},
  ) { }

  value(): Middleware {
    const supported = (this.opts.supportedVersions || [])
      .map(s => s.toLowerCase())
      .filter(Boolean);

    const latestVersion = (() => {
      const nums = supported
        .map(v => {
          const m = v.match(/^v(\d+)$/i);
          return m ? Number(m[1]) : NaN;
        })
        .filter(n => !Number.isNaN(n));
      return nums.length ? `v${Math.max(...nums)}` : undefined;
    })();

    const latestAliasRe = new RegExp(`^/${'latest'}(/.*|$)`, 'i');
    const versionPrefixRe = /^\/(v\d+)(\/.*|$)/i;

    const mergeUrl = (newPath: string, origUrl: string) => {
      const q = origUrl && origUrl.includes('?') ? origUrl.slice(origUrl.indexOf('?')) : '';
      return newPath + q;
    };

    const tryNext = async (ctx: MiddlewareContext, next: Next) => {
      try {
        await next();
        return true;
      } catch (err) {
        const status = (err && (err.status || err.statusCode)) || undefined;
        if (status === 404 || (err && err.name === 'NotFoundError')) {
          return false;
        }
        throw err;
      }
    };

    return async (ctx: MiddlewareContext, next: Next) => {
      const req = ctx.request;
      const origUrl = req.url || '/';
      const origPath = req.path || '/';

      const urlMatch = origPath.match(versionPrefixRe);
      if (urlMatch) {
        const versionInPath = urlMatch[1].toLowerCase();
        if (supported.includes(versionInPath)) {
          return next();
        } else {
          const error = new Error(`Unsupported API version in URL: ${versionInPath}`);
          (error as any).statusCode = 400;
          throw error;
        }
      }

      const latestAliasMatch = origPath.match(latestAliasRe);
      if (latestAliasMatch) {
        if (!latestVersion) {
          const error = new Error('No latest API version defined.');
          (error as any).statusCode = 404;
          throw error;
        }
        const rest = latestAliasMatch[1] || '';
        const newPath = `/${latestVersion}${rest}`;
        req.url = mergeUrl(newPath, origUrl);
        return next();
      }

      const initialAttemptSuccess = await tryNext(ctx, next);
      if (initialAttemptSuccess) {
        return;
      }

      let versionToUse: string | undefined;

      if (this.opts.headerName) {
        const versionFromHeader = req.headers[this.opts.headerName.toLowerCase()] as string;
        if (versionFromHeader) {
          versionToUse = versionFromHeader.toLowerCase();
          if (!supported.includes(versionToUse)) {
            const error = new Error(`Unsupported API version in header: ${versionToUse}`);
            (error as any).statusCode = 400;
            throw error;
          }
        }
      }

      if (!versionToUse && latestVersion) {
        versionToUse = latestVersion;
      }

      if (versionToUse) {
        const newPath = `/${versionToUse}${origPath}`;
        req.url = mergeUrl(newPath, origUrl);
        return next();
      }

      return next();
    };
  }
}
