import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LocationService } from '@/location/location.service';
import {
  CreateLocationDto,
  FindOneQuery,
  UpdateLocationDto,
} from '@/location/dto';
import { Location } from '@/location/location.entity';
import { PaginatedResult } from '@/common/types/metadata.type';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  findAll(
    @Query('type') type: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<Location>> {
    const { page, limit } = paginationQuery;
    return this.locationService.findAll(type, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: FindOneQuery) {
    return this.locationService.findOne(+id, query.includeChildren);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }
}
