import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Refund, RefundRelations} from '../models';

export class RefundRepository extends DefaultCrudRepository<
  Refund,
  typeof Refund.prototype.id,
  RefundRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Refund, dataSource);
  }
}
