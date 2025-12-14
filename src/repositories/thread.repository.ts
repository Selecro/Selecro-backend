import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {Thread, ThreadRelations} from '../models';

export class ThreadRepository extends DefaultCrudRepository<
  Thread,
  typeof Thread.prototype.id,
  ThreadRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(Thread, dataSource);
  }
}
