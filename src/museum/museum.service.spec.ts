import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MuseumEntity } from './museum.entity/museum.entity';
import { MuseumService } from './museum.service';
import { faker } from '../shared/testing-utils/faker-adapter';

describe('MuseumService', () => {
  it('should use default pagination values when page and limit are not provided', async () => {
    const result = await service.findAllFiltered({});
    expect(result.meta.currentPage).toBe(1);
    expect(result.meta.itemsPerPage).toBe(10);
  });

  it('should paginate results according to page and limit', async () => {
    //PONGO MUCHOS MUSEOS PARA ASEGURAR PAGINACION
    for (let i = 0; i < 15; i++) {
      await repository.save({
        name: `Museo Extra ${i}`,
        description: `Desc ${i}`,
        address: `Addr ${i}`,
        city: `Ciudad ${i}`,
        image: `img${i}.jpg`,
        foundedBefore: 1800 + i,
        exhibitions: [],
        artworks: []
      });
    }
    const result = await service.findAllFiltered({ skip: 10, take: 5 });
    expect(result.data.length).toBeLessThanOrEqual(5);
    expect(result.meta.currentPage).toBe(3); 
    expect(result.meta.itemsPerPage).toBe(5);
  });

  it('should filter and paginate at the same time', async () => {
    for (let i = 0; i < 8; i++) {
      await repository.save({
        name: `Museo Oro ${i}`,
        description: `Desc Oro ${i}`,
        address: `Addr Oro ${i}`,
        city: `CiudadOro`,
        image: `imgOro${i}.jpg`,
        foundedBefore: 1700 + i,
        exhibitions: [],
        artworks: []
      });
    }
    const result = await service.findAllFiltered({ name: 'Oro', skip: 0, take: 5 });
    expect(result.data.length).toBeLessThanOrEqual(5);
    expect(result.data.every(m => m.name.includes('Oro'))).toBe(true);
    expect(result.meta.currentPage).toBe(1);
    expect(result.meta.totalItems).toBeGreaterThanOrEqual(8);
  });

  it('should return correct meta when filtering by city and foundedBefore', async () => {
    const city = museumsList[0].city;
    const year = museumsList[0].foundedBefore;
    const result = await service.findAllFiltered({ city, foundedBefore: year });
    expect(result.data.every(m => m.city === city && m.foundedBefore <= year)).toBe(true);
    expect(result.meta.totalItems).toBeGreaterThanOrEqual(1);
  });
  let service: MuseumService;
  let repository: Repository<MuseumEntity>;
  let museumsList: MuseumEntity[] = [];

  const seedDatabase = async () => {
    await repository.clear();
    museumsList = [];
    for (let i = 0; i < 5; i++) {
      const museum: Partial<MuseumEntity> = {
        name: (faker.company as any).name?.() || `Company ${i}`,
        description: (faker.lorem as any).sentence?.() || `Description ${i}`,
        address: (faker.address as any).secondaryAddress?.() || `Address ${i}`,
        city: (faker.location as any).city?.() || (faker.address as any).city?.() || `City ${i}`,
        image: (faker.image as any).imageUrl?.(i) || (faker.image as any).url?.(i) || `https://picsum.photos/seed/${i}/200/200`,
        foundedBefore: 1900 + i,
        exhibitions: [],
        artworks: []
      };
      const saved = await repository.save(museum);
      museumsList.push(saved);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MuseumService],
    }).compile();

    service = module.get<MuseumService>(MuseumService);
    repository = module.get<Repository<MuseumEntity>>(getRepositoryToken(MuseumEntity));
    await seedDatabase();
  });

  it('findAllFiltered should return all museums by default', async () => {
    const result = await service.findAllFiltered({});
    expect(result).not.toBeNull();
    expect(result.data.length).toBeGreaterThanOrEqual(museumsList.length);
    expect(result.meta).toHaveProperty('totalItems');
    expect(result.meta).toHaveProperty('currentPage');
  });

  it('findAllFiltered should filter by city', async () => {
    const city = museumsList[0].city;
    const result = await service.findAllFiltered({ city });
    expect(result.data.every(m => m.city === city)).toBe(true);
  });

  it('findAllFiltered should filter by foundedBefore', async () => {
    const year = museumsList[2].foundedBefore;
    const result = await service.findAllFiltered({ foundedBefore: year });
    expect(result.data.every(m => m.foundedBefore <= year)).toBe(true);
  });

  it('findAllFiltered should paginate with skip and take', async () => {
    const result = await service.findAllFiltered({ skip: 1, take: 2 });
    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.meta).toHaveProperty('totalItems');
  });

  it('findAllFiltered should filter by partial city', async () => {
    const cityFragment = museumsList[0].city.substring(0, 3);
    const result = await service.findAllFiltered({ city: cityFragment });
    expect(result.data.some(m => m.city.includes(cityFragment))).toBe(true);
  });

  it('findAllFiltered should filter by partial name', async () => {
    const nameFragment = museumsList[0].name.substring(0, 3);
    const result = await service.findAllFiltered({ name: nameFragment });
    expect(result.data.some(m => m.name.includes(nameFragment))).toBe(true);
  });

  it('findAllFiltered should filter by foundedBefore and city', async () => {
    const year = museumsList[2].foundedBefore;
    const city = museumsList[2].city;
    const result = await service.findAllFiltered({ foundedBefore: year, city });
    expect(result.data.every(m => m.foundedBefore <= year && m.city.includes(city))).toBe(true);
  });

  it('findOne should return a museum by id', async () => {
    const storedMuseum: MuseumEntity = museumsList[0];
    const museum: MuseumEntity = await service.findOne(storedMuseum.id);
    expect(museum).not.toBeNull();
    expect(museum.name ?? '').toEqual(storedMuseum.name ?? '')
    expect(museum.description ?? '').toEqual(storedMuseum.description ?? '')
    expect(museum.address ?? '').toEqual(storedMuseum.address ?? '')
    expect(museum.city ?? '').toEqual(storedMuseum.city ?? '')
    expect(museum.image ?? '').toEqual(storedMuseum.image ?? '')
    expect(museum.foundedBefore ?? 0).toEqual(storedMuseum.foundedBefore ?? 0)
  });

  it('findOne should throw an exception for an invalid museum', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The museum with the given id was not found")
  });

  it('create should return a new museum', async () => {
    const f: any = faker;
    const museum: MuseumEntity = {
      id: "",
      name: f.company?.name?.() ?? 'Company',
      description: f.lorem?.sentence?.() ?? 'Description',
      address: f.address?.secondaryAddress?.() ?? 'Address',
      city: f.location?.city?.() ?? f.address?.city?.() ?? 'City',
      image: f.image?.imageUrl?.() ?? f.image?.url?.() ?? 'https://picsum.photos/200/200',
      foundedBefore: 2000,
      exhibitions: [],
      artworks: []
    }
    const newMuseum: MuseumEntity = await service.create(museum);
    expect(newMuseum).not.toBeNull();
    const storedMuseum = await repository.findOne({where: {id: newMuseum.id}})
    expect(storedMuseum).not.toBeNull();
    expect(storedMuseum!.name ?? '').toEqual(newMuseum.name ?? '')
    expect(storedMuseum!.description ?? '').toEqual(newMuseum.description ?? '')
    expect(storedMuseum!.address ?? '').toEqual(newMuseum.address ?? '')
    expect(storedMuseum!.city ?? '').toEqual(newMuseum.city ?? '')
    expect(storedMuseum!.image ?? '').toEqual(newMuseum.image ?? '')
    expect(storedMuseum!.foundedBefore ?? 0).toEqual(newMuseum.foundedBefore ?? 0)
  });

  it('update should modify a museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    museum.name = "New name";
    museum.address = "New address";
    museum.foundedBefore = 1800;
    const updatedMuseum: MuseumEntity = await service.update(museum.id, museum);
    expect(updatedMuseum).not.toBeNull();
    const storedMuseum = await repository.findOne({ where: { id: museum.id } })
    expect(storedMuseum).not.toBeNull();
    expect(storedMuseum!.name ?? '').toEqual(museum.name ?? '')
    expect(storedMuseum!.address ?? '').toEqual(museum.address ?? '')
    expect(storedMuseum!.foundedBefore ?? 0).toEqual(museum.foundedBefore ?? 0)
  });

  it('update should throw an exception for an invalid museum', async () => {
    let museum: MuseumEntity = museumsList[0];
    museum = {
      ...museum, name: "New name", address: "New address"
    }
    await expect(() => service.update("0", museum)).rejects.toHaveProperty("message", "The museum with the given id was not found")
  });

  it('delete should remove a museum', async () => {
    const museum: MuseumEntity = museumsList[0];
    await service.delete(museum.id);
    const deletedMuseum = await repository.findOne({ where: { id: museum.id } })
    expect(deletedMuseum).toBeNull();
  });

  it('delete should throw an exception for an invalid museum', async () => {
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The museum with the given id was not found")
  });
});