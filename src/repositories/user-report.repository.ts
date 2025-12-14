import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {UserReport, UserReportRelations} from '../models';

export class UserReportRepository extends DefaultCrudRepository<
  UserReport,
  typeof UserReport.prototype.id,
  UserReportRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(UserReport, dataSource);
  }
}
