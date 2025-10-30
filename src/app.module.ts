import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MuseumModule } from './museum/museum.module';
import { ExhibitionModule } from './exhibition/exhibition.module';
import { ArtworkModule } from './artwork/artwork.module';
import { ArtistModule } from './artist/artist.module';
import { SponsorEntityModule } from './sponsor-entity/sponsor-entity.module';
import { SponsorModule } from './sponsor/sponsor.module';
import { ImageEntityModule } from './image-entity/image-entity.module';
import { ImageModule } from './image/image.module';
import { MovementModule } from './movement/movement.module';

@Module({
  imports: [MuseumModule, ExhibitionModule, ArtworkModule, ArtistModule, SponsorEntityModule, SponsorModule, ImageEntityModule, ImageModule, MovementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
