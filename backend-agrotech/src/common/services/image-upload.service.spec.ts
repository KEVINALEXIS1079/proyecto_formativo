import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ImageUploadService } from './image-upload.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

jest.mock('fs');
jest.mock('sharp');
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockSharp = sharp as jest.MockedFunction<typeof sharp>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with config values', () => {
      mockConfigService.get
        .mockReturnValueOnce('uploads')
        .mockReturnValueOnce(5 * 1024 * 1024);

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation();

      new ImageUploadService(configService);

      expect(mockConfigService.get).toHaveBeenCalledWith('UPLOAD_DEST', 'uploads');
      expect(mockConfigService.get).toHaveBeenCalledWith('UPLOAD_MAX_SIZE', 5 * 1024 * 1024);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('uploads', { recursive: true });
    });

    it('should not create directory if it exists', () => {
      mockConfigService.get
        .mockReturnValueOnce('uploads')
        .mockReturnValueOnce(5 * 1024 * 1024);

      mockFs.existsSync.mockReturnValue(true);

      new ImageUploadService(configService);

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('uploadImage', () => {
    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('test image data'),
      mimetype: 'image/jpeg',
      size: 1024,
      originalname: 'test.jpg',
      fieldname: 'file',
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    beforeEach(() => {
      mockConfigService.get
        .mockReturnValueOnce('uploads')
        .mockReturnValueOnce(5 * 1024 * 1024);

      mockFs.existsSync.mockReturnValue(true);
      (uuidv4 as jest.Mock).mockReturnValue('unique-id');
    });

    it('should upload image successfully', async () => {
      mockFs.writeFileSync.mockImplementation();

      const result = await service.uploadImage(mockFile);

      expect(result).toBe('/uploads/unique-id.jpg');
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads', 'unique-id.jpg'),
        mockFile.buffer
      );
    });

    it('should upload image with custom folder', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation();
      mockFs.writeFileSync.mockImplementation();

      const result = await service.uploadImage(mockFile, { folder: 'profiles' });

      expect(result).toBe('/uploads/profiles/unique-id.jpg');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads', 'profiles'),
        { recursive: true }
      );
    });

    it('should resize image when options provided', async () => {
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('resized image')),
      };
      mockSharp.mockReturnValue(mockSharpInstance as any);
      mockFs.writeFileSync.mockImplementation();

      const result = await service.uploadImage(mockFile, {
        resize: { width: 200, height: 200 }
      });

      expect(mockSharp).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(200, 200, { fit: 'inside' });
      expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads', 'unique-id.jpg'),
        Buffer.from('resized image')
      );
    });

    it('should throw BadRequestException for non-image files', async () => {
      const nonImageFile = { ...mockFile, mimetype: 'text/plain' };

      await expect(service.uploadImage(nonImageFile)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.uploadImage(nonImageFile)).rejects.toThrow(
        'Solo se permiten archivos de imagen'
      );
    });

    it('should throw BadRequestException for files exceeding max size', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 }; // 10MB

      await expect(service.uploadImage(largeFile)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.uploadImage(largeFile)).rejects.toThrow(
        'El archivo excede el tamaño máximo de 5242880 bytes'
      );
    });

    it('should handle sharp processing errors', async () => {
      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockRejectedValue(new Error('Sharp error')),
      };
      mockSharp.mockReturnValue(mockSharpInstance as any);

      await expect(service.uploadImage(mockFile, {
        resize: { width: 200, height: 200 }
      })).rejects.toThrow('Sharp error');
    });

    it('should handle file system errors', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      await expect(service.uploadImage(mockFile)).rejects.toThrow('File system error');
    });
  });
});