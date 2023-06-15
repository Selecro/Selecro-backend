import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Instruction, InstructionRelations} from '../models';

export class InstructionRepository extends DefaultCrudRepository<
  Instruction,
  typeof Instruction.prototype.id,
  InstructionRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Instruction, dataSource);
  }
}
