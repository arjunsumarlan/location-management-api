import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from '@/location/location.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLocationDto, UpdateLocationDto } from '@/location/dto';

describe('LocationService', () => {
  let service: LocationService;
  let locationRepository: Repository<Location>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getRepositoryToken(Location),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    locationRepository = module.get<Repository<Location>>(
      getRepositoryToken(Location),
    );
  });

  describe('create', () => {
    it('should create and return a new location', async () => {
      const createLocationDto: CreateLocationDto = {
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parentId: null,
      };

      const savedLocation = {
        id: 1,
        ...createLocationDto,
        parent: null,
        children: null,
      };

      jest
        .spyOn(locationRepository, 'create')
        .mockReturnValue(savedLocation as any);
      jest.spyOn(locationRepository, 'save').mockResolvedValue(savedLocation);

      const result = await service.create(createLocationDto);
      expect(result).toEqual(savedLocation);
    });

    it('should throw NotFoundException if parent location is not found', async () => {
      const createLocationDto: CreateLocationDto = {
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parentId: 99,
      };

      jest.spyOn(locationRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(locationRepository, 'create')
        .mockReturnValue({ ...createLocationDto, children: [] } as Location);

      await expect(service.create(createLocationDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if save fails', async () => {
      const createLocationDto: CreateLocationDto = {
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parentId: null,
      };

      jest
        .spyOn(locationRepository, 'create')
        .mockReturnValue(createLocationDto as any);
      jest
        .spyOn(locationRepository, 'save')
        .mockRejectedValue(new Error('Save error'));

      await expect(service.create(createLocationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated locations', async () => {
      const paginatedResult = {
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

      jest
        .spyOn(locationRepository, 'findAndCount')
        .mockResolvedValue([paginatedResult.data, 1]);

      const result = await service.findAll('roots', 1, 10);
      expect(result).toEqual(paginatedResult);
    });

    it('should throw BadRequestException if find fails', async () => {
      jest
        .spyOn(locationRepository, 'findAndCount')
        .mockRejectedValue(new Error('Find error'));

      await expect(service.findAll('roots', 1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a location by ID', async () => {
      const location = {
        id: 1,
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parent: null,
        children: [],
      };

      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValue(location as any);

      const result = await service.findOne(1, false);
      expect(result).toEqual(location);
    });

    it('should throw NotFoundException if location not found', async () => {
      jest.spyOn(locationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1, false)).rejects.toThrow(
        NotFoundException,
      );
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

      const existingLocation = {
        id: 1,
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parent: null,
        children: [],
      };
      const updatedLocation = { ...existingLocation, ...updateLocationDto };

      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValue(existingLocation as any);
      jest
        .spyOn(locationRepository, 'save')
        .mockResolvedValue(updatedLocation as any);

      const result = await service.update(1, updateLocationDto);
      expect(result).toEqual(updatedLocation);
    });

    it('should throw NotFoundException if location not found', async () => {
      jest.spyOn(locationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update(1, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if save fails', async () => {
      const updateLocationDto: UpdateLocationDto = {
        building: 'B',
        name: 'Updated Car Park',
        number: 'B-CarPark',
        area: 85.0,
        parentId: null,
      };

      const existingLocation = {
        id: 1,
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parent: null,
        children: [],
      };

      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValue(existingLocation as any);
      jest
        .spyOn(locationRepository, 'save')
        .mockRejectedValue(new Error('Save error'));

      await expect(service.update(1, updateLocationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on circular reference', async () => {
      const updateLocationDto: UpdateLocationDto = {
        building: 'B',
        name: 'Updated Car Park',
        number: 'B-CarPark',
        area: 85.0,
        parentId: 2,
      };

      const existingLocation = {
        id: 1,
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parent: null,
        children: [],
      };

      const parentLocation = {
        id: 2,
        building: 'B',
        name: 'Another Car Park',
        number: 'B-CarPark',
        area: 90.0,
        parent: existingLocation, // This creates the circular reference
        children: [],
      };

      // Mock the first call to findOne: it returns the existing location to update
      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValueOnce(existingLocation as any);

      // Mock the second call to findOne: it returns the parent location, which references the existing location
      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValueOnce(parentLocation as any);

      // Ensure the third call to findOne to resolve the parent chain returns the parent location again
      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValueOnce(existingLocation as any);

      await expect(service.update(1, updateLocationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a location and return success message', async () => {
      const location = {
        id: 1,
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parent: null,
        children: [],
      };

      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValue(location as any);
      jest
        .spyOn(locationRepository, 'remove')
        .mockResolvedValue(location as any);

      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Location deleted successfully.' });
    });

    it('should throw NotFoundException if location not found', async () => {
      jest.spyOn(locationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if remove fails', async () => {
      const location = {
        id: 1,
        building: 'A',
        name: 'Car Park',
        number: 'A-CarPark',
        area: 80.62,
        parent: null,
        children: [],
      };

      jest
        .spyOn(locationRepository, 'findOne')
        .mockResolvedValue(location as any);
      jest
        .spyOn(locationRepository, 'remove')
        .mockRejectedValue(new Error('Remove error'));

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});
