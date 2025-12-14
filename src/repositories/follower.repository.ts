import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Follower, FollowerRelations} from '../models';

export class FollowerRepository extends DefaultCrudRepository<
  Follower,
  typeof Follower.prototype.followerUserId,
  FollowerRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Follower, dataSource);
  }
}
