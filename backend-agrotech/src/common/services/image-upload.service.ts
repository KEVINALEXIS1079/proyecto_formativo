import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageUploadService {
  private readonly uploadDest: string;
  private readonly maxSize: number;

  constructor(private readonly configService: ConfigService) {
    this.uploadDest = this.configService.get<string>('UPLOAD_DEST', 'uploads');
    this.maxSize = this.configService.get<number>('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB default

    // Crear directorio de uploads si no existe
    const uploadPath = path.join(process.cwd(), this.uploadDest);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    options?: { resize?: { width: number; height: number }; folder?: string },
  ): Promise<string> {
    // Validar tipo de archivo
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten archivos de imagen');
    }

    // Validar tamaño
    if (file.size > this.maxSize) {
      throw new BadRequestException(`El archivo excede el tamaño máximo de ${this.maxSize} bytes`);
    }

    // Crear directorio si no existe
    const folderPath = options?.folder ? path.join(this.uploadDest, options.folder) : this.uploadDest;
    const uploadPath = path.join(process.cwd(), folderPath);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar nombre único
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadPath, filename);

    let buffer = file.buffer;

    // Procesar imagen si se especifica redimensionamiento
    if (options?.resize) {
      buffer = await sharp(buffer)
        .resize(options.resize.width, options.resize.height, { fit: 'inside' })
        .toBuffer();
    }

    // Guardar archivo
    fs.writeFileSync(filePath, buffer);

    // Retornar URL relativa
    const relativePath = options?.folder ? `/${folderPath}/${filename}` : `/${this.uploadDest}/${filename}`;
    return relativePath;
  }
}