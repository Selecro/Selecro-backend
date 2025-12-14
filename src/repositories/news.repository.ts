import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {News, NewsRelations} from '../models';

export class NewsRepository extends DefaultCrudRepository<
  News,
  typeof News.prototype.id,
  NewsRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(News, dataSource);
  }
}
