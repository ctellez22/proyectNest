import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, ILike } from 'typeorm';
import { MuseumEntity } from './museum.entity/museum.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class MuseumService {    
    constructor(
        @InjectRepository(MuseumEntity)
        private readonly museumRepository: Repository<MuseumEntity>
    ) {}

    async findAllFiltered(query: { city?: string; name?: string; foundedBefore?: number; skip?: number; take?: number }) {
        const { city, name, foundedBefore, skip = 0, take = 10 } = query;
        const where: any = {};
        if (city) where.city = ILike(`%${city}%`);
        if (name) where.name = ILike(`%${name}%`);
        if (foundedBefore) where.foundedBefore = LessThanOrEqual(foundedBefore);

        const [data, total] = await this.museumRepository.findAndCount({
            where,
            skip,
            take,
            relations: ["artworks", "exhibitions"]
        });

        const currentPage = Math.floor(skip / take) + 1;
        const totalPages = Math.ceil(total / take);

        return {
            data,
            meta: {
                totalItems: total,
                itemCount: data.length,
                itemsPerPage: take,
                totalPages,
                currentPage,
            }
        };
    }
    async findOne(id: string): Promise<MuseumEntity> {
        const museum = await this.museumRepository.findOne({
            where: { id },
            relations: ["artworks", "exhibitions"]
        });
        if (!museum)
            throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);

        return museum;
    }
    async create(museum: MuseumEntity): Promise<MuseumEntity> {
        return await this.museumRepository.save(museum);
    }

    async update(id: string, museum: MuseumEntity): Promise<MuseumEntity> {
        const persistedMuseum = await this.museumRepository.findOne({
            where: { id },
            relations: ["artworks", "exhibitions"]
        });
        if (!persistedMuseum)
            throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
            
        return await this.museumRepository.save({
            ...persistedMuseum,
            ...museum,
            id: id
        });
    }

    async delete(id: string): Promise<void> {
        const museum = await this.museumRepository.findOne({
            where: { id },
            relations: ["artworks", "exhibitions"]
        });
        if (!museum)
            throw new BusinessLogicException("The museum with the given id was not found", BusinessError.NOT_FOUND);
    
        await this.museumRepository.remove(museum);
   }
    }
