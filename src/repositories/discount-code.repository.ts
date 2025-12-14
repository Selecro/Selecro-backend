import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {DiscountCode, DiscountCodeRelations} from '../models';

export class DiscountCodeRepository extends DefaultCrudRepository<
  DiscountCode,
  typeof DiscountCode.prototype.id,
  DiscountCodeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(DiscountCode, dataSource);
  }
}
