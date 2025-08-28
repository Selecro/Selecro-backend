import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'follower'},
    foreignKeys: {
      follower_followed_id_fkeyRel: {
        name: 'follower_followed_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'followed_id'
      },
      follower_follower_id_fkeyRel: {
        name: 'follower_follower_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'follower_id'
      }
    },
    indexes: {
      idx_follower_follower_id: {
        keys: {follower_id: 1}
      },
      idx_follower_followed_id: {
        keys: {followed_id: 1}
      },
      uq_follower_pair: {
        keys: {follower_id: 1, followed_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class Follower extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {columnName: 'id', dataType: 'bigint', dataScale: 0, nullable: 'NO', generated: true},
  })
  id: number;

  @belongsTo(() => User)
  follower_id: number;

  @belongsTo(() => User)
  followed_id: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: new Date(),
    postgresql: {columnName: 'followed_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  followed_at: string;

  @property({
    type: 'boolean',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    default: true,
    postgresql: {columnName: 'is_active', dataType: 'boolean', nullable: 'NO', generated: false},
  })
  is_active: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Follower>) {
    super(data);
  }
}

export interface FollowerRelations {
  // describe navigational properties here
}

export type FollowerWithRelations = Follower & FollowerRelations;
