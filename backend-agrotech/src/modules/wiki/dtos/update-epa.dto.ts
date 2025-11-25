import { PartialType } from '@nestjs/mapped-types';
import { CreateEpaDto } from './create-epa.dto';

export class UpdateEpaDto extends PartialType(CreateEpaDto) {}
