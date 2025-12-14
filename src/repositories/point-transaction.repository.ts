import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {PointTransaction, PointTransactionRelations} from '../models';

export class PointTransactionRepository extends DefaultCrudRepository<
  PointTransaction,
  typeof PointTransaction.prototype.id,
  PointTransactionRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(PointTransaction, dataSource);
  }
}
