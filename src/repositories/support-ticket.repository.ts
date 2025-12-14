import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresqlDataSource} from '../datasources';
import {SupportTicket, SupportTicketRelations} from '../models';

export class SupportTicketRepository extends DefaultCrudRepository<
  SupportTicket,
  typeof SupportTicket.prototype.id,
  SupportTicketRelations
> {
  constructor(
    @inject('datasources.postgresql') dataSource: PostgresqlDataSource,
  ) {
    super(SupportTicket, dataSource);
  }
}
