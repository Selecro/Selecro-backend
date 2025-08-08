import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Manual, User} from '.';

@model({
  settings: {
    idInjection: false,
    postgresql: {schema: 'public', table: 'manual_purchase'},
    foreignKeys: {
      manual_purchase_manual_id_fkeyRel: {
        name: 'manual_purchase_manual_id_fkeyRel',
        entity: 'Manual',
        entityKey: 'id',
        foreignKey: 'manual_id'
      },
      manual_purchase_user_id_fkeyRel: {
        name: 'manual_purchase_user_id_fkeyRel',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id'
      }
    },
    indexes: {
      idx_manual_purchase_user_id: {
        keys: {user_id: 1}
      },
      idx_manual_purchase_manual_id: {
        keys: {manual_id: 1}
      },
      idx_manual_purchase_purchase_date: {
        keys: {purchase_date: 1}
      },
      uq_manual_purchase_transaction_id: {
        keys: {transaction_id: 1},
        options: {unique: true}
      }
    }
  }
})
export class ManualPurchase extends Entity {
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

  @belongsTo(() => Manual)
  manual_id: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'purchase_date', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  purchase_date: string;

  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 2,
    generated: false,
    postgresql: {columnName: 'price_paid', dataType: 'numeric', dataPrecision: 10, dataScale: 2, nullable: 'NO', generated: false},
  })
  price_paid: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'currency', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  currency: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    index: {unique: true},
    postgresql: {columnName: 'transaction_id', dataType: 'character varying', dataLength: 255, nullable: 'YES', generated: false},
  })
  transaction_id?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 255,
    generated: false,
    postgresql: {columnName: 'payment_status', dataType: 'character varying', dataLength: 255, nullable: 'NO', generated: false},
  })
  payment_status: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  created_at: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO', generated: false},
  })
  updated_at: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ManualPurchase>) {
    super(data);
  }
}

export interface ManualPurchaseRelations {
  // describe navigational properties here
}

export type ManualPurchaseWithRelations = ManualPurchase & ManualPurchaseRelations;
