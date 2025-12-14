import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {ManualProductCategory, ManualProductCategoryRelations} from '../models';

export class ManualProductCategoryRepository extends DefaultCrudRepository<
  ManualProductCategory,
  typeof ManualProductCategory.prototype.id,
  ManualProductCategoryRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(ManualProductCategory, dataSource);
  }
}
