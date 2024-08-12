import { Module } from '@nestjs/common';
import { LocationService } from '@/location/location.service';
import { LocationController } from '@/location/location.controller';
import { Location } from '@/location/location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}
