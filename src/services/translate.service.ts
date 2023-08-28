import * as dotenv from 'dotenv';
import {Instruction, Language, Step} from '../models';
dotenv.config();

export class TranslateService {
  constructor() { }

  async translateInstructionCreate(
    input: Omit<
      Instruction,
      'id' | 'userId' | 'date' | 'link' | 'deleteHash' | 'titleCz' | 'titleEn'
    > & {title: string},
    language: Language,
  ): Promise<
    Omit<Instruction, 'id' | 'userId' | 'date' | 'link' | 'deleteHash'>
  > {
    const {title, ...inputWithoutTitle} = input;
    const instruction: Omit<
      Instruction,
      'id' | 'userId' | 'date' | 'link' | 'deleteHash'
    > = {
      titleCz: title,
      titleEn: title,
      ...inputWithoutTitle,
    };
    return instruction;
  }

  async translateInstructionPatch(
    input: Partial<Instruction> & {title: string},
    language: Language,
  ): Promise<Partial<Instruction>> {
    const {title, ...inputWithoutTitle} = input;
    const instruction: Partial<Instruction> = {
      titleCz: title,
      titleEn: title,
      ...inputWithoutTitle,
    };
    return instruction;
  }

  async translateStepCreate(
    input: Omit<
      Step,
      | 'id'
      | 'instructionId'
      | 'titleCz'
      | 'titleEn'
      | 'descriptionCz'
      | 'descriptionEn'
    > & {title: string; description: string[]},
    language: Language,
  ): Promise<Omit<Step, 'id' | 'instructionId'>> {
    const {title, description, ...inputWithoutTitle} = input;
    const step: Omit<Step, 'id' | 'instructionId'> = {
      titleCz: title,
      titleEn: title,
      descriptionCz: description,
      descriptionEn: description,
      ...inputWithoutTitle,
    };
    return step;
  }

  async translateStepPatch(
    input: Partial<Step> & {title: string; description: string[]},
    language: Language,
  ): Promise<Partial<Step>> {
    const {title, description, ...inputWithoutTitle} = input;
    const step: Partial<Step> = {
      titleCz: title,
      titleEn: title,
      descriptionCz: description,
      descriptionEn: description,
      ...inputWithoutTitle,
    };
    return step;
  }
}
