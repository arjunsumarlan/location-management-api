import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Location } from '@/location/location.entity';
import { CreateLocationDto, UpdateLocationDto } from '@/location/dto';
import {
  PaginatedResult,
  PaginationMetadata,
} from '../common/types/metadata.type';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  private readonly logger = new Logger(LocationService.name);

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { parentId, ...locationData } = createLocationDto;

    const location = this.locationRepository.create(locationData);

    if (parentId) {
      const parent = await this.locationRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent Location with ID ${parentId} not found`,
        );
      }
      location.parent = parent;
    }

    try {
      const savedLocation = await this.locationRepository.save(location);
      this.logger.log(`Location created with ID ${savedLocation.id}`);
      return savedLocation;
    } catch (error) {
      this.logger.error('Failed to create location', error.stack);
      throw new BadRequestException('Failed to create location');
    }
  }

  async findAll(
    type?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Location>> {
    const skip = (page - 1) * limit;

    let whereCondition;
    if (type === 'roots') {
      whereCondition = { parent: IsNull() };
    } else if (type === 'children') {
      whereCondition = { parent: Not(IsNull()) };
    }

    try {
      const [result, total] = await this.locationRepository.findAndCount({
        where: whereCondition,
        relations: ['parent', 'children'],
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);
      const nextPage = page < totalPages ? page + 1 : null;
      const previousPage = page > 1 ? page - 1 : null;

      const metadata: PaginationMetadata = {
        total,
        page,
        limit,
        nextPage,
        previousPage,
      };

      return {
        data: result,
        metadata,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve locations', error.stack);
      throw new BadRequestException('Failed to retrieve locations');
    }
  }

  async findOne(id: number, includeChildren: boolean): Promise<Location> {
    const relations = includeChildren
      ? this.buildRelations('children', 3)
      : ['parent'];

    const location = await this.locationRepository.findOne({
      where: { id },
      relations,
    });
    if (!location) {
      this.logger.warn(`Location with ID ${id} not found`);
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  private buildRelations(relation: string, depth: number): string[] {
    const relations: string[] = [];

    for (let i = 0; i < depth; i++) {
      const currentRelation = Array(i + 1)
        .fill(relation)
        .join('.');
      relations.push(currentRelation);
    }

    return relations;
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const { parentId, ...locationData } = updateLocationDto;

    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    // If a new parentId is provided, validate and load the parent location
    if (parentId && location.parent?.id !== parentId) {
      const parent = await this.locationRepository.findOne({
        where: { id: parentId },
        relations: ['parent'], // Fetch parent relation to perform circular check
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent Location with ID ${parentId} not found`,
        );
      }

      // Check for circular reference
      let currentParent = parent;
      while (currentParent) {
        if (currentParent.id === id) {
          throw new BadRequestException(
            'Circular reference detected. Cannot set this parent.',
          );
        }
        if (!currentParent.parent?.id) {
          break;
        }
        currentParent = await this.locationRepository.findOne({
          where: { id: currentParent.parent.id },
          relations: ['parent'],
        });
      }

      // Assign the new parent if the circular check passes
      location.parent = parent;
    } else if (parentId === null) {
      // If parentId is explicitly set to null, clear the parent
      location.parent = null;
    }

    // Assign the rest of the updated data to the location
    Object.assign(location, locationData);

    try {
      const updatedLocation = await this.locationRepository.save(location);
      this.logger.log(`Location with ID ${id} updated successfully`);
      return updatedLocation;
    } catch (error) {
      this.logger.error(`Failed to update location with ID ${id}`, error.stack);
      throw new BadRequestException(`Failed to update location with ID ${id}`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    // Check if the location has both a parent and children
    if (location.parent && location.children.length > 0) {
      // Reassign the children to the parent
      for (const child of location.children) {
        child.parent = location.parent;
        await this.locationRepository.save(child);
      }
    }

    try {
      await this.locationRepository.remove(location);
      this.logger.log(`Location with ID ${id} deleted successfully`);
      return { message: 'Location deleted successfully.' };
    } catch (error) {
      this.logger.error(`Failed to delete location with ID ${id}`, error.stack);
      throw new BadRequestException(`Failed to delete location with ID ${id}`);
    }
  }
}
