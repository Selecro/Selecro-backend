import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum TwoFactorAuthMethodType {
  Email = 'email',
  TOTP = 'TOTP',
  Biometric = 'biometric',
  U2F = 'U2F'
}

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'two_factor_auth_method'},
    foreignKeys: {
      two_factor_auth_method_user_id_fkeyRel: {
        name: 'two_factor_auth_method_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      uq_user_two_factor_auth_method_type: {
        keys: {user_id: 1, two_factor_auth_method_type: 1},
        options: {unique: true}
      }
    }
  }
})
export class TwoFactorAuthMethod extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  user_id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      nullable: false,
      enum: Object.values(TwoFactorAuthMethodType)
    },
    length: 255,
    generated: false,
    postgresql: {columnName: 'two_factor_auth_method_type', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  two_factor_auth_method_type: TwoFactorAuthMethodType;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'is_primary', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  is_primary: boolean;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'two_factor_auth_method_enabled', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  two_factor_auth_method_enabled: boolean;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: false,
    postgresql: {columnName: 'verified', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  verified: boolean;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'secret_data', dataType: 'text', nullable: 'YES', generated: false},
  })
  secret_data?: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<TwoFactorAuthMethod>) {
    super(data);
  }
}

export interface TwoFactorAuthMethodRelations {
  // describe navigational properties here
}

export type TwoFactorAuthMethodWithRelations = TwoFactorAuthMethod & TwoFactorAuthMethodRelations;
