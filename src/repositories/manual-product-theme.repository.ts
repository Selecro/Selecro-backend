import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {ManualProductTheme, ManualProductThemeRelations} from '../models';

export class ManualProductThemeRepository extends DefaultCrudRepository<
  ManualProductTheme,
  typeof ManualProductTheme.prototype.id,
  ManualProductThemeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(ManualProductTheme, dataSource);
  }
}
