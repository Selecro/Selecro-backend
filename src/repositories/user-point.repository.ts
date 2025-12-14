import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserPoint, UserPointRelations} from '../models';

export class UserPointRepository extends DefaultCrudRepository<
  UserPoint,
  typeof UserPoint.prototype.userId,
  UserPointRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserPoint, dataSource);
  }
}
