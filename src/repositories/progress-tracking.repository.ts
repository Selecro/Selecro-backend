import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {ProgressTracking, ProgressTrackingRelations} from '../models';

export class ProgressTrackingRepository extends DefaultCrudRepository<
  ProgressTracking,
  typeof ProgressTracking.prototype.id,
  ProgressTrackingRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(ProgressTracking, dataSource);
  }
}
