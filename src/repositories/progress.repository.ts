import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Progress, ProgressRelations} from '../models';

export class ProgressRepository extends DefaultCrudRepository<
  Progress,
  typeof Progress.prototype.id,
  ProgressRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Progress, dataSource);
  }
}
