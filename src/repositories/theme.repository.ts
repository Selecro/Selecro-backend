import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Theme, ThemeRelations} from '../models';

export class ThemeRepository extends DefaultCrudRepository<
  Theme,
  typeof Theme.prototype.id,
  ThemeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Theme, dataSource);
  }
}
