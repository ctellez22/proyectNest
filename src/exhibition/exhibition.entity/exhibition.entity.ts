import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { MuseumEntity } from '../../museum/museum.entity/museum.entity';
import { ArtworkEntity } from '../../artwork/artwork.entity/artwork.entity';
import { SponsorEntity } from '../../sponsor/sponsor.entity/sponsor.entity';

@Entity('exhibitions')
export class ExhibitionEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
 
    @Column()
    name: string;
 
    @Column()
    description: string;

    @ManyToOne(() => MuseumEntity, museum => museum.exhibitions)
    museum: MuseumEntity;

    @OneToMany(() => ArtworkEntity, artwork => artwork.exhibition)
    artworks: ArtworkEntity[];

    @OneToOne(() => SponsorEntity, sponsor => sponsor.exhibition)
    @JoinColumn()
    sponsor: SponsorEntity;


}