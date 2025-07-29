import {Entity, model, property} from '@loopback/repository';
import {Manual, User} from '.';

export enum Currency {
  CZK = 'CZK',
  EUR = 'EUR',
  USD = 'USD',
}

export enum PaymentStatus {
  pending = 'pending',
  completed = 'completed',
  failed = 'failed',
  refunded = 'refunded',
}

@model({
  name: 'manual_purchase',
  settings: {
    postgresql: {
      table: 'manual_purchase',
      indexes: {
        uniqueUserManualPurchase: {
          keys: {
            user_id: 1,
            manual_id: 1,
          },
          options: {
            unique: true,
          },
        },
      },
    },
    foreignKeys: {
      fk_manual_purchase_userId: {
        name: 'fk_manual_purchase_userId',
        entity: 'user',
        entityKey: 'id',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
      fk_manual_purchase_manualId: {
        name: 'fk_manual_purchase_manualId',
        entity: 'manual',
        entityKey: 'id',
        foreignKey: 'manual_id',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      },
    },
  }
})
export class ManualPurchase extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataType: 'bigint',
      nullable: 'NO',
      generated: true,
    },
  })
  id?: number;

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
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'user_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  userId: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'manual_id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  manualId: number;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'purchase_date',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  purchaseDate: Date;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'price_paid',
      dataType: 'decimal',
      dataPrecision: 10,
      dataScale: 2,
      nullable: 'NO',
    },
  })
  pricePaid: number;

  @property({
    type: 'string',
    required: true,
    default: Currency.CZK,
    jsonSchema: {
      enum: Object.values(Currency),
    },
    postgresql: {
      columnName: 'currency',
      dataType: 'text',
      nullable: 'NO',
      default: 'CZK',
    },
  })
  currency: Currency;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'transaction_id',
      dataType: 'varchar',
      dataLength: 255,
      nullable: 'YES',
      unique: true,
    },
  })
  transactionId?: string;

  @property({
    type: 'string',
    required: true,
    default: PaymentStatus.pending,
    jsonSchema: {
      enum: Object.values(PaymentStatus),
    },
    postgresql: {
      columnName: 'payment_status',
      dataType: 'text',
      nullable: 'NO',
      default: 'pending',
    },
  })
  paymentStatus: PaymentStatus;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    postgresql: {
      columnName: 'created_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  createdAt: Date;

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
    updateDefaultFn: 'now',
    postgresql: {
      columnName: 'updated_at',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
      default: 'CURRENT_TIMESTAMP',
    },
  })
  updatedAt: Date;

  constructor(data?: Partial<ManualPurchase>) {
    super(data);
  }
}

export interface ManualPurchaseRelations {
  user?: User;
  manual?: Manual;
}

export type ManualPurchaseWithRelations = ManualPurchase & ManualPurchaseRelations;
