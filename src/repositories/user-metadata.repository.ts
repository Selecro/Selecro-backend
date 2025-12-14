import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserMetadata, UserMetadataRelations} from '../models';

export class UserMetadataRepository extends DefaultCrudRepository<
  UserMetadata,
  typeof UserMetadata.prototype.userId,
  UserMetadataRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserMetadata, dataSource);
  }
}
