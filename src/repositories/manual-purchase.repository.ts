import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {ManualPurchase, ManualPurchaseRelations} from '../models';

export class ManualPurchaseRepository extends DefaultCrudRepository<
  ManualPurchase,
  typeof ManualPurchase.prototype.id,
  ManualPurchaseRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(ManualPurchase, dataSource);
  }
}
