import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Manual, ManualRelations} from '../models';

export class ManualRepository extends DefaultCrudRepository<
  Manual,
  typeof Manual.prototype.id,
  ManualRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Manual, dataSource);
  }
}
