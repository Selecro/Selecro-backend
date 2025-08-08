import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'two_factor_auth_log'},
    foreignKeys: {
      two_factor_auth_log_user_id_fkeyRel: {
        name: 'two_factor_auth_log_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_two_factor_auth_log_user_id: {
        keys: {user_id: 1}
      },
      idx_two_factor_auth_log_method_type: {
        keys: {method_type: 1}
      },
      idx_two_factor_auth_log_attempted_at: {
        keys: {attempted_at: 1}
      }
    }
  }
})
export class TwoFactorAuthLog extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: false},
  })
  id: number;

  @belongsTo(() => User)
  user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'method_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  method_type: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'success', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  success: boolean;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'attempted_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  attempted_at: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 45,
    generated: false,
    postgresql: {columnName: 'ip_address', dataType: 'character varying', dataLength: 45, nullable: 'YES', generated: false},
  })
  ip_address?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<TwoFactorAuthLog>) {
    super(data);
  }
}

export interface TwoFactorAuthLogRelations {
  // describe navigational properties here
}

export type TwoFactorAuthLogWithRelations = TwoFactorAuthLog & TwoFactorAuthLogRelations;
