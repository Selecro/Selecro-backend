import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {SavedCart, SavedCartRelations} from '../models';

export class SavedCartRepository extends DefaultCrudRepository<
  SavedCart,
  typeof SavedCart.prototype.id,
  SavedCartRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(SavedCart, dataSource);
  }
}
