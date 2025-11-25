import { BadRequestException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/messages';

export class Validators {
  /**
   * Valida que un valor no sea null o undefined
   */
  static required<T>(value: T | null | undefined, fieldName: string): T {
    if (value === null || value === undefined) {
      throw new BadRequestException(ERROR_MESSAGES.REQUIRED_FIELD(fieldName));
    }
    return value;
  }

  /**
   * Valida que un número sea positivo
   */
  static positiveNumber(value: number, fieldName: string): number {
    if (value <= 0) {
      throw new BadRequestException(`${fieldName} debe ser un número positivo`);
    }
    return value;
  }

  /**
   * Valida que un número no sea negativo
   */
  static nonNegativeNumber(value: number, fieldName: string): number {
    if (value < 0) {
      throw new BadRequestException(`${fieldName} no puede ser negativo`);
    }
    return value;
  }

  /**
   * Valida formato de email
   */
  static email(value: string, fieldName: string = 'email'): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new BadRequestException(`${fieldName} no es un correo válido`);
    }
    return value;
  }

  /**
   * Valida fortaleza de contraseña
   */
  static password(value: string): string {
    if (value.length < 8) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.WEAK_PASSWORD);
    }
    if (!/[A-Z]/.test(value)) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.WEAK_PASSWORD);
    }
    if (!/[a-z]/.test(value)) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.WEAK_PASSWORD);
    }
    if (!/[0-9]/.test(value)) {
      throw new BadRequestException(ERROR_MESSAGES.AUTH.WEAK_PASSWORD);
    }
    return value;
  }

  /**
   * Valida que un string no esté vacío
   */
  static notEmpty(value: string, fieldName: string): string {
    if (!value || value.trim().length === 0) {
      throw new BadRequestException(`${fieldName} no puede estar vacío`);
    }
    return value.trim();
  }

  /**
   * Valida que un valor esté en un array de opciones
   */
  static inArray<T>(value: T, options: T[], fieldName: string): T {
    if (!options.includes(value)) {
      throw new BadRequestException(
        `${fieldName} debe ser uno de: ${options.join(', ')}`
      );
    }
    return value;
  }

  /**
   * Valida rango de fecha
   */
  static dateRange(start: Date, end: Date, fieldName: string = 'fecha'): void {
    if (start > end) {
      throw new BadRequestException(
        `La fecha de inicio no puede ser posterior a la fecha de fin en ${fieldName}`
      );
    }
  }

  /**
   * Valida que un array no esté vacío
   */
  static notEmptyArray<T>(value: T[], fieldName: string): T[] {
    if (!value || value.length === 0) {
      throw new BadRequestException(`${fieldName} no puede estar vacío`);
    }
    return value;
  }

  /**
   * Valida XOR (uno u otro, no ambos)
   */
  static xor(
    value1: any,
    value2: any,
    field1Name: string,
    field2Name: string
  ): void {
    const has1 = value1 !== null && value1 !== undefined;
    const has2 = value2 !== null && value2 !== undefined;

    if (has1 && has2) {
      throw new BadRequestException(
        `Debe especificar ${field1Name} O ${field2Name}, no ambos`
      );
    }

    if (!has1 && !has2) {
      throw new BadRequestException(
        `Debe especificar al menos ${field1Name} o ${field2Name}`
      );
    }
  }

  /**
   * Valida stock disponible
   */
  static sufficientStock(
    available: number,
    requested: number,
    unit: string = 'unidades'
  ): void {
    if (available < requested) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVENTORY.INSUFFICIENT_STOCK(available, requested, unit)
      );
    }
  }

  /**
   * Valida que un objeto exista (para resultados de DB)
   */
  static exists<T>(
    entity: T | null | undefined,
    entityName: string,
    id: number | string
  ): T {
    if (!entity) {
      throw new BadRequestException(ERROR_MESSAGES.NOT_FOUND(entityName, id));
    }
    return entity;
  }
}
