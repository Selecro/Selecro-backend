import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {EducationStep, EducationStepRelations} from '../models';

export class EducationStepRepository extends DefaultCrudRepository<
  EducationStep,
  typeof EducationStep.prototype.id,
  EducationStepRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(EducationStep, dataSource);
  }
}
