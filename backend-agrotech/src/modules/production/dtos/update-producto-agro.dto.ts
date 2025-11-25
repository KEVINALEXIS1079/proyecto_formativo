import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoAgroDto } from './create-producto-agro.dto';

export class UpdateProductoAgroDto extends PartialType(CreateProductoAgroDto) {}
