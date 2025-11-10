import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuseumService } from './museum.service';
import { MuseumEntity } from './museum.entity/museum.entity';
import { MuseumController } from './museum.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MuseumEntity])],
  providers: [MuseumService],
  exports: [MuseumService],
  controllers: [MuseumController]
})
export class MuseumModule {}
