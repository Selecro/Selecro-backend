import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {UserLink, UserLinkRelations} from '../models';

export class UserLinkRepository extends DefaultCrudRepository<
  UserLink,
  typeof UserLink.prototype.id,
  UserLinkRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(UserLink, dataSource);
  }
}
