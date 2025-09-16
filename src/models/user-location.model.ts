import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Session} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'user_location'},
    foreignKeys: {
      user_location_user_id_fkeyRel: {
        name: 'user_location_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      },
      user_location_session_id_fkeyRel: {
        name: 'user_location_session_id_fkeyRel',
        entity: 'Session',
        entityKey: 'id',
        foreignKey: 'session_id'
      }
    },
    indexes: {
      idx_user_location_user_id: {
        keys: {user_id: 1},
        options: {unique: true}
      },
      idx_user_location_country: {
        keys: {country: 1}
      },
      idx_user_location_city: {
        keys: {city: 1}
      },
      idx_user_location_session_id: {
        keys: {session_id: 1}
      }
    }
  }
})
export class UserLocation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    postgresql: {columnName: 'user_id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: false},
  })
  user_id: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'country', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  country?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    postgresql: {columnName: 'city', dataType: 'character varying', dataLength: 100, nullable: 'YES', generated: false},
  })
  city?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 20,
    generated: false,
    postgresql: {columnName: 'postal_code', dataType: 'character varying', dataLength: 20, nullable: 'YES', generated: false},
  })
  postal_code?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    postgresql: {columnName: 'street_address', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  street_address?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 8,
    generated: false,
    postgresql: {columnName: 'latitude', dataType: 'numeric', dataPrecision: 10, dataScale: 8, nullable: 'YES', generated: false},
  })
  latitude?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 11,
    scale: 8,
    generated: false,
    postgresql: {columnName: 'longitude', dataType: 'numeric', dataPrecision: 11, dataScale: 8, nullable: 'YES', generated: false},
  })
  longitude?: number;

  @belongsTo(() => Session)
  session_id?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserLocation>) {
    super(data);
  }
}

export interface UserLocationRelations {
  // describe navigational properties here
}

export type UserLocationWithRelations = UserLocation & UserLocationRelations;
