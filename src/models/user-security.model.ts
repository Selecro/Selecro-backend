import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_security'},
    foreignKeys: {
      user_security_user_id_fkeyRel: {
        name: 'user_security_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_user_security_user_id: {
        keys: {user_id: 1},
        options: {unique: true}
      },
      idx_user_security_failed_login_attempts: {
        keys: {failed_login_attempts: 1}
      }
    }
  }
})
export class UserSecurity extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'user_id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: false},
  })
  user_id: number;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'two_factor_enabled', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  two_factor_enabled: boolean;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'recovery_email', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  recovery_email?: string;

  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    postgresql: {columnName: 'failed_login_attempts', dataType: 'integer', dataScale: 0, nullable: 'NO', generated: false},
  })
  failed_login_attempts: number;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'password_last_changed_at', dataType: 'timestamp without time zone', nullable: 'YES', generated: false},
  })
  password_last_changed_at?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 45,
    generated: false,
    postgresql: {columnName: 'last_login_ip', dataType: 'character varying', dataLength: 45, nullable: 'YES', generated: false},
  })
  last_login_ip?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'password_hash', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  password_hash?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserSecurity>) {
    super(data);
  }
}

export interface UserSecurityRelations {
  // describe navigational properties here
}

export type UserSecurityWithRelations = UserSecurity & UserSecurityRelations;
