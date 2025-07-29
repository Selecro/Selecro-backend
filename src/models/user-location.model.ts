import {Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  name: 'user_location',
  settings: {
    postgresql: {
      table: 'user_location',
    },
    foreignKeys: {
      fk_user_location_userId: {
        name: 'fk_user_location_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class UserLocation extends Entity {
  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  userId: number;

  @property({
    type: 'string',
    defaultFn: 'uuidv4',
    postgresql: {
      columnName: 'uuid',
      dataType: 'varchar',
      dataLength: 36,
      nullable: 'NO',
      unique: true,
    },
  })
  uuid: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'country',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  country?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'city',
      dataType: 'varchar',
      dataLength: 100,
      nullable: 'YES',
    },
  })
  city?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'postal_code',
      dataType: 'varchar',
      dataLength: 20,
      nullable: 'YES',
    },
  })
  postalCode?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'street_address',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
    },
  })
  streetAddress?: string;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'latitude',
      dataType: 'decimal',
      dataPrecision: 10,
      dataScale: 8,
      nullable: 'YES',
    },
  })
  latitude?: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'longitude',
      dataType: 'decimal',
      dataPrecision: 11,
      dataScale: 8,
      nullable: 'YES',
    },
  })
  longitude?: number;

  constructor(data?: Partial<UserLocation>) {
    super(data);
  }
}

export interface UserLocationRelations {
  user?: User;
}

export type UserLocationWithRelations = UserLocation & UserLocationRelations;
