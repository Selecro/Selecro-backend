import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import {IpFilter, IpFilterOptions, IpList} from 'express-ipfilter';

type IpFilterHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

export class IpFilterMiddlewareProvider implements Provider<Middleware> {
  private ipList: IpList;
  private filterOptions: IpFilterOptions;

  constructor(
    @inject('ipFilter.ips', {optional: true})
    ipList: IpList = [],
    @inject('ipFilter.options', {optional: true})
    filterOptions: IpFilterOptions = {},
  ) {
    this.ipList = ipList;
    this.filterOptions = {
      mode: filterOptions.mode ?? 'deny',
      ...filterOptions,
    };
  }

  value(): Middleware {
    const ipFilterHandler: IpFilterHandler = IpFilter(this.ipList, this.filterOptions);

    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        ipFilterHandler(ctx.request, ctx.response, err => {
          if (err) {
            console.error('IP Filter middleware error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });

      return next();
    };
  }
}
