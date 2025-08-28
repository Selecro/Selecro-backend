import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {ManualProgress, ManualProgressRelations} from '../models';

export class ManualProgressRepository extends DefaultCrudRepository<
  ManualProgress,
  typeof ManualProgress.prototype.id,
  ManualProgressRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(ManualProgress, dataSource);
  }
}
