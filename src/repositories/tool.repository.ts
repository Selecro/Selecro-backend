import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Tool, ToolRelations} from '../models';

export class ToolRepository extends DefaultCrudRepository<
  Tool,
  typeof Tool.prototype.id,
  ToolRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Tool, dataSource);
  }
}
