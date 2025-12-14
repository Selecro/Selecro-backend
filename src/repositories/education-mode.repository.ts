import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {EducationMode, EducationModeRelations} from '../models';

export class EducationModeRepository extends DefaultCrudRepository<
  EducationMode,
  typeof EducationMode.prototype.id,
  EducationModeRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(EducationMode, dataSource);
  }
}
