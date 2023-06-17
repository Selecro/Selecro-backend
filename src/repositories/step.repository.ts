import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Step, StepRelations} from '../models';

export class StepRepository extends DefaultCrudRepository<
  Step,
  typeof Step.prototype.id,
  StepRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Step, dataSource);
  }
}
