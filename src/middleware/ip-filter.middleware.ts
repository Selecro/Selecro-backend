import {inject, Provider} from '@loopback/core';
import {Middleware, Request, Response} from '@loopback/rest';
import {IpFilter, IpFilterOptions, IpList} from 'express-ipfilter';
import {IpFilterBindings} from '../keys';

type IpFilterHandler = (req: Request, res: Response, next: (err?: any) => any) => void;

const DEFAULT_IP_FILTER_OPTIONS: IpFilterOptions = {
  mode: 'deny',
};

export class IpFilterMiddlewareProvider implements Provider<Middleware> {
  private ipFilterHandler: IpFilterHandler;

  constructor(
    @inject(IpFilterBindings.IP_LIST, {optional: true})
    private ipList: IpList = [],
    @inject(IpFilterBindings.OPTIONS, {optional: true})
    private injectedOptions?: IpFilterOptions,
  ) {
    const finalOptions: IpFilterOptions = {
      ...DEFAULT_IP_FILTER_OPTIONS,
      ...this.injectedOptions,
    };
    this.ipFilterHandler = IpFilter(this.ipList, finalOptions);
  }

  value(): Middleware {
    return async (ctx, next) => {
      await new Promise<void>((resolve, reject) => {
        this.ipFilterHandler(ctx.request, ctx.response, err => {
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
