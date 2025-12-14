import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {EntityFile, EntityFileRelations} from '../models';

export class EntityFileRepository extends DefaultCrudRepository<
  EntityFile,
  typeof EntityFile.prototype.id,
  EntityFileRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(EntityFile, dataSource);
  }
}
