import { IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateSensorLecturaDto {
  @IsNumber()
  @IsNotEmpty()
  sensorId: number;

  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @IsDateString()
  @IsNotEmpty()
  fechaLectura: Date;
}
