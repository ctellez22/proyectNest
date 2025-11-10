import { Controller, UseInterceptors, Get, Param, Post, Body, Put, Delete, HttpCode, Query } from '@nestjs/common';
import { MuseumService } from './museum.service';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors/business-errors.interceptor';
import { MuseumEntity } from './museum.entity/museum.entity';


import { plainToInstance } from 'class-transformer';
import { MuseumDto } from './museum.dto/museum.dto';

@Controller('museums')
@UseInterceptors(BusinessErrorsInterceptor)
export class MuseumController {
	constructor(private readonly museumService: MuseumService) {}

	
	@Get()
	async findAll(
		@Query('city') city?: string,
		@Query('name') name?: string,
		@Query('foundedBefore') foundedBefore?: number,
		@Query('page') page?: number,
		@Query('limit') limit?: number,
	) {
		// Valores por defecto
		const pageNum = page && page > 0 ? Number(page) : 1;
		const limitNum = limit && limit > 0 ? Number(limit) : 10;
		const skip = (pageNum - 1) * limitNum;
		const take = limitNum;
		const result = await this.museumService.findAllFiltered({
			city,
			name,
			foundedBefore: foundedBefore ? Number(foundedBefore) : undefined,
			skip,
			take,
		});
		return result;
	}

		@Get(':museumId')
		async findOne(@Param('museumId') museumId: string) {
			return await this.museumService.findOne(museumId);
		}

		@Post()
		async create(@Body() museumDto: MuseumDto) {
			const museum: MuseumEntity = plainToInstance(MuseumEntity, museumDto);
			return await this.museumService.create(museum);
		}

		@Put(':museumId')
		async update(@Param('museumId') museumId: string, @Body() museumDto: MuseumDto) {
			const museum: MuseumEntity = plainToInstance(MuseumEntity, museumDto);
			return await this.museumService.update(museumId, museum);
		}

		@Delete(':museumId')
		@HttpCode(204)
		async delete(@Param('museumId') museumId: string) {
			return await this.museumService.delete(museumId);
		}
}


