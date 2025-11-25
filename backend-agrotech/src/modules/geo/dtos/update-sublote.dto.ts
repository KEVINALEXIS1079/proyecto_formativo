import { PartialType } from '@nestjs/mapped-types';
import { CreateSubLoteDto } from './create-sublote.dto';

export class UpdateSubLoteDto extends PartialType(CreateSubLoteDto) {}
