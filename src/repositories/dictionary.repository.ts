import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Dictionary, DictionaryRelations} from '../models';

export class DictionaryRepository extends DefaultCrudRepository<
  Dictionary,
  typeof Dictionary.prototype.id,
  DictionaryRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Dictionary, dataSource);
  }
}
