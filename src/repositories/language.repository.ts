import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Language, LanguageRelations} from '../models';

export class LanguageRepository extends DefaultCrudRepository<
  Language,
  typeof Language.prototype.id,
  LanguageRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Language, dataSource);
  }
}
