import {MethodDecoratorFactory} from '@loopback/core';

export const AUTHORIZE_METADATA_KEY = 'authorize';

export function authorize(...permissions: string[]) {
  return MethodDecoratorFactory.createDecorator(
    AUTHORIZE_METADATA_KEY,
    permissions,
  );
}
