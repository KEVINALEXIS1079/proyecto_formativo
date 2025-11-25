import { Test, TestingModule } from '@nestjs/testing';
import { WikiGateway } from './wiki.gateway';
import { WikiController } from '../controllers/wiki.controller';
import { Server, Socket } from 'socket.io';

describe('WikiGateway', () => {
  let gateway: WikiGateway;
  let wikiController: WikiController;
  let mockServer: Server;
  let mockClient: Socket;

  const mockWikiController = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllTiposCultivo: jest.fn(),
  };

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
    } as any;

    mockClient = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WikiGateway,
        {
          provide: WikiController,
          useValue: mockWikiController,
        },
      ],
    }).compile();

    gateway = module.get<WikiGateway>(WikiGateway);
    wikiController = module.get<WikiController>(WikiController);

    // Set the server manually since it's not injected
    (gateway as any).server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('findAllEpas', () => {
    it('should call controller findAll and emit result', async () => {
      const filters = { tipoCultivoId: 1 } as any;
      const expectedResult = [{ id: 1, nombre: 'EPA 1' }];

      mockWikiController.findAll.mockResolvedValue(expectedResult);

      const result = await gateway.findAll(filters, mockClient);

      expect(mockWikiController.findAll).toHaveBeenCalledWith(filters);
      expect(mockClient.emit).toHaveBeenCalledWith('findAllEpas.result', expectedResult);
      expect(result).toBe(expectedResult);
    });
  });

  describe('findEpaById', () => {
    it('should call controller findOne and emit result', async () => {
      const data = { id: 1 };
      const expectedResult = { id: 1, nombre: 'EPA 1' };

      mockWikiController.findOne.mockResolvedValue(expectedResult);

      const result = await gateway.findOne(data, mockClient);

      expect(mockWikiController.findOne).toHaveBeenCalledWith(1);
      expect(mockClient.emit).toHaveBeenCalledWith('findEpaById.result', expectedResult);
      expect(result).toBe(expectedResult);
    });
  });

  describe('createEpa', () => {
    it('should call controller create and emit result', async () => {
      const createEpaDto = { nombre: 'Nueva EPA', tipoCultivoId: 1, tipoEpa: 'tipo' } as any;
      const expectedResult = { id: 1, ...createEpaDto };

      mockWikiController.create.mockResolvedValue(expectedResult);

      const result = await gateway.create(createEpaDto, mockClient);

      expect(mockWikiController.create).toHaveBeenCalledWith(createEpaDto);
      expect(mockClient.emit).toHaveBeenCalledWith('createEpa.result', expectedResult);
      expect(result).toBe(expectedResult);
    });
  });

  describe('updateEpa', () => {
    it('should call controller update and emit result', async () => {
      const payload = { id: 1, data: { nombre: 'EPA Actualizada' } };
      const expectedResult = { id: 1, nombre: 'EPA Actualizada' };

      mockWikiController.update.mockResolvedValue(expectedResult);

      const result = await gateway.update(payload, mockClient);

      expect(mockWikiController.update).toHaveBeenCalledWith(1, { nombre: 'EPA Actualizada' });
      expect(mockClient.emit).toHaveBeenCalledWith('updateEpa.result', expectedResult);
      expect(result).toBe(expectedResult);
    });
  });

  describe('removeEpa', () => {
    it('should call controller remove and emit result', async () => {
      const data = { id: 1 };
      const expectedResult = { message: 'EPA eliminada' };

      mockWikiController.remove.mockResolvedValue(expectedResult);

      const result = await gateway.remove(data, mockClient);

      expect(mockWikiController.remove).toHaveBeenCalledWith(1);
      expect(mockClient.emit).toHaveBeenCalledWith('removeEpa.result', expectedResult);
      expect(result).toBe(expectedResult);
    });
  });

  describe('findAllTiposCultivo', () => {
    it('should call controller findAllTiposCultivo and emit result', async () => {
      const data = {};
      const expectedResult = [{ id: 1, nombre: 'Tipo 1' }];

      mockWikiController.findAllTiposCultivo.mockResolvedValue(expectedResult);

      const result = await gateway.findAllTiposCultivo(data, mockClient);

      expect(mockWikiController.findAllTiposCultivo).toHaveBeenCalled();
      expect(mockClient.emit).toHaveBeenCalledWith('findAllTiposCultivo.result', expectedResult);
      expect(result).toBe(expectedResult);
    });
  });

  describe('broadcast', () => {
    it('should emit event to all clients', () => {
      const event = 'testEvent';
      const data = { message: 'test' };

      gateway.broadcast(event, data);

      expect(mockServer.emit).toHaveBeenCalledWith(event, data);
    });
  });
});