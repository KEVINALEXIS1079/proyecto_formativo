import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaFormacionDto } from './create-programa-formacion.dto';

export class UpdateProgramaFormacionDto extends PartialType(CreateProgramaFormacionDto) { }
