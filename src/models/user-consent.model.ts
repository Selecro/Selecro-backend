import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'user_consent'}}
})
export class UserConsent extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'user_id', dataType: 'bigint', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO', generated: false},
  })
  userId: number;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'terms_of_service_accepted_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  termsOfServiceAcceptedAt: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'tos_version', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  tosVersion: string;

  @property({
    type: 'date',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'privacy_policy_accepted_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  privacyPolicyAcceptedAt: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    generated: false,
    postgresql: {columnName: 'pp_version', dataType: 'character varying', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  ppVersion: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'marketing_consent_given_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  marketingConsentGivenAt?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'marketing_consent_revoked_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  marketingConsentRevokedAt?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    postgresql: {columnName: 'data_processing_consent_given_at', dataType: 'timestamp with time zone', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  dataProcessingConsentGivenAt?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<UserConsent>) {
    super(data);
  }
}

export interface UserConsentRelations {
  // describe navigational properties here
}

export type UserConsentWithRelations = UserConsent & UserConsentRelations;
