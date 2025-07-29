import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {ManualStep, ManualStepRelations} from '../models';

export class ManualStepRepository extends DefaultCrudRepository<
  ManualStep,
  typeof ManualStep.prototype.id,
  ManualStepRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(ManualStep, dataSource);
  }
}
