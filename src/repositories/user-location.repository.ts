import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserLocation, UserLocationRelations} from '../models';

export class UserLocationRepository extends DefaultCrudRepository<
  UserLocation,
  typeof UserLocation.prototype.userId,
  UserLocationRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserLocation, dataSource);
  }
}
