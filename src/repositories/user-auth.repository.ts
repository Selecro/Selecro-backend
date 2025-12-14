import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserAuth, UserAuthRelations} from '../models';

export class UserAuthRepository extends DefaultCrudRepository<
  UserAuth,
  typeof UserAuth.prototype.userId,
  UserAuthRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserAuth, dataSource);
  }
}
