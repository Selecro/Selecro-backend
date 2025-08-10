import {Next, Provider, inject} from '@loopback/core';
import {Middleware, MiddlewareContext} from '@loopback/rest';

export interface ApiVersioningOptions {
  supportedVersions?: string[];
}

export class ApiVersioningMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject('versioning.options', {optional: true})
    private opts: ApiVersioningOptions = {},
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

    const latestAlias = 'latest';
    const versionPrefixRe = /^\/(v\d+)(\/.*|$)/i;
    const latestAliasRe = new RegExp(`^/${latestAlias}(/.*|$)`, 'i');

    const mergeUrl = (newPath: string, origUrl: string) => {
      const q = origUrl && origUrl.includes('?') ? origUrl.slice(origUrl.indexOf('?')) : '';
      return newPath + q;
    };

    return async (ctx: MiddlewareContext, next: Next) => {
      const req = ctx.request;
      const origUrl = req.url || '/';
      const origPath = req.path || '/';

      const tryNext = async () => {
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

      const m = origPath.match(versionPrefixRe);
      if (m) {
        return next();
      }

      const n = origPath.match(latestAliasRe);
      if (n) {
        const rest = n[1] || '/';

        if (latestVersion) {
          const newPath = `/${latestVersion}${rest}`;
          req.url = mergeUrl(newPath, origUrl);
          if (await tryNext()) {
            return;
          }
        }

        const newPath = `${rest}`;
        req.url = mergeUrl(newPath, origUrl);

        if (await tryNext()) {
          return;
        }

        return next();
      }

      req.url = origUrl;
      if (await tryNext()) {
        return;
      }

      if (latestVersion) {
        const newPath = `/${latestVersion}${origPath}`;
        req.url = mergeUrl(newPath, origUrl);

        if (await tryNext()) {
          return;
        }
      }

      return next();
    };
  }
}
