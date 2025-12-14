import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {OrderDiscount, OrderDiscountRelations} from '../models';

export class OrderDiscountRepository extends DefaultCrudRepository<
  OrderDiscount,
  typeof OrderDiscount.prototype.id,
  OrderDiscountRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(OrderDiscount, dataSource);
  }
}
