import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto, FindOneQuery } from './dto';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { Location } from './location.entity';
import { PaginatedResult } from '@/common/types/metadata.type';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new location', async () => {
      const createLocationDto: CreateLocationDto = {
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parentId: null,
      };

      const createdLocation = {
        id: 1,
        ...createLocationDto,
        children: [],
      } as Location;

      jest.spyOn(service, 'create').mockResolvedValue(createdLocation);

      expect(await controller.create(createLocationDto)).toEqual(
        createdLocation,
      );
      expect(service.create).toHaveBeenCalledWith(createLocationDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of locations', async () => {
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const paginatedResult: PaginatedResult<Location> = {
        data: [
          {
            id: 1,
            building: 'A',
            name: 'Car Park',
            number: 'A-CarPark',
            area: 80.62,
            parent: null,
            children: [],
          },
        ],
        metadata: {
          total: 1,
          page: 1,
          limit: 10,
          nextPage: null,
          previousPage: null,
        },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(paginatedResult);

      expect(await controller.findAll('roots', paginationQuery)).toEqual(
        paginatedResult,
      );
      expect(service.findAll).toHaveBeenCalledWith('roots', 1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a single location', async () => {
      const location = {
        id: 1,
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parent: null,
        children: [],
      } as Location;

      jest.spyOn(service, 'findOne').mockResolvedValue(location);

      expect(await controller.findOne('1', { includeChildren: false })).toEqual(
        location,
      );
      expect(service.findOne).toHaveBeenCalledWith(1, false);
    });
  });

  describe('update', () => {
    it('should update and return the location', async () => {
      const updateLocationDto: UpdateLocationDto = {
        building: 'B',
        name: 'Updated Car Park',
        number: 'B-CarPark',
        area: 85.0,
        parentId: null,
      };

      const updatedLocation = {
        id: 1,
        ...updateLocationDto,
        children: [],
      } as Location;

      jest.spyOn(service, 'update').mockResolvedValue(updatedLocation);

      expect(await controller.update('1', updateLocationDto)).toEqual(
        updatedLocation,
      );
      expect(service.update).toHaveBeenCalledWith(1, updateLocationDto);
    });
  });

  describe('remove', () => {
    it('should remove the location and return a success message', async () => {
      const result = { message: 'Location deleted successfully.' };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
