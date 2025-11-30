import { IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateSensorLecturaDto {
  @IsNumber()
  @IsNotEmpty()
  sensorId: number;

  @IsNotEmpty()
  valor: any;

  @IsDateString()
  @IsNotEmpty()
  fechaLectura: Date;
}
