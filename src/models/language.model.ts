import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, postgresql: {schema: 'public', table: 'language'}}
})
export class Language extends Entity {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {nullable: false},
    scale: 0,
    generated: false,
    id: 1,
    postgresql: {columnName: 'id', dataType: 'integer', dataLength: null, dataPrecision: null, dataScale: 0, nullable: 'NO', generated: false},
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 10,
    generated: false,
    postgresql: {columnName: 'language_code', dataType: 'character varying', dataLength: 10, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  languageCode: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {nullable: false},
    length: 100,
    generated: false,
    postgresql: {columnName: 'language_name', dataType: 'character varying', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'NO', generated: false},
  })
  languageName: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Language>) {
    super(data);
  }
}

export interface LanguageRelations {
  // describe navigational properties here
}

export type LanguageWithRelations = Language & LanguageRelations;
