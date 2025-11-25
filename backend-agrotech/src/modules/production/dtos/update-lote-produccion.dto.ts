import { PartialType } from '@nestjs/mapped-types';
import { CreateLoteProduccionDto } from './create-lote-produccion.dto';

export class UpdateLoteProduccionDto extends PartialType(CreateLoteProduccionDto) {}