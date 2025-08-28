import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {NewsDelivery, NewsDeliveryRelations} from '../models';

export class NewsDeliveryRepository extends DefaultCrudRepository<
  NewsDelivery,
  typeof NewsDelivery.prototype.id,
  NewsDeliveryRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(NewsDelivery, dataSource);
  }
}
