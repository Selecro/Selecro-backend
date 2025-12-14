import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {ProductType, ProductTypeRelations} from '../models';

export class ProductTypeRepository extends DefaultCrudRepository<
  ProductType,
  typeof ProductType.prototype.id,
  ProductTypeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(ProductType, dataSource);
  }
}
