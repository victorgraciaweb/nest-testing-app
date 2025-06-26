import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PokemonsService', () => {
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PokemonsService],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('Should create a new pokemon', async () => {
      const data = {
        name: 'pikachu',
        type: 'electricidad',
      };

      const pokemonCreated = await service.create(data);

      expect(pokemonCreated).toHaveProperty('id');
      expect(pokemonCreated.name).toBe(data.name);
      expect(pokemonCreated.type).toBe(data.type);
      expect(pokemonCreated.hp).toBe(0);
      expect(pokemonCreated.sprites).toEqual([]);

      expect(service.pokemonsCache.get(pokemonCreated.id)).toEqual(
        pokemonCreated,
      );
    });

    it('Should not save if already exists', async () => {
      const data = {
        name: 'pikachudde',
        type: 'electricidad',
      };

      await service.create(data);

      try {
        await service.create(data);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('findAll', () => {
    it('Should find all pokemon and cache all', async () => {
      const limit = 10;
      const page = 1;
      const cacheKey = `${limit}-${page}`;

      const pokemons = await service.findAll({ limit: limit, page: page });
      service.paginatedPokemonsCache.set(cacheKey, pokemons);

      expect(service.paginatedPokemonsCache.get(cacheKey)).toBe(pokemons);
    });

    it('should store and return pokemons from cache', async () => {
      const limit = 15;
      const page = 1;
      const cacheKey = `${limit}-${page}`;

      const pokemons = await service.findAll({ limit, page });
      const cachedResult = await service.findAll({ limit, page });

      expect(service.paginatedPokemonsCache.has(cacheKey)).toBe(true);
      expect(service.paginatedPokemonsCache.get(cacheKey)).toEqual(pokemons);
      expect(cachedResult).toEqual(pokemons);
    });
  });

  describe('findOne', () => {
    it('Should return pokemon by id', async () => {
      const id = 2;

      const pokemon = await service.findOne(id);

      expect(pokemon).toEqual({
        id: 2,
        name: 'ivysaur',
        type: 'grass',
        hp: 60,
        sprites: [
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png',
        ],
      });
    });

    it('Should return 404 if not exist', async () => {
      const id = 8888;

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `Not found register with id ${id}`,
      );
    });

    it('Should check properties of the pokemon', async () => {
      const id = 3;
      const pokemon = await service.findOne(id);

      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toEqual(
        expect.objectContaining({
          hp: expect.any(Number),
        }),
      );
    });

    it('Should return pokemon cached', async () => {
      const id = 3;
      const pokemon = await service.findOne(id);

      const spy = jest.spyOn(service as any, 'getPokemonInformation');

      const pokemonCached = await service.findOne(id);
      expect(pokemon).toBe(pokemonCached);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return pokemon if found', async () => {
      const id = 1;
      const existingPokemon = {
        id,
        name: 'Pikachu',
        type: 'electric',
        hp: 35,
        sprites: [],
      };
      const updateDto = { name: 'Raichu' };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingPokemon);

      const result = await service.update(id, updateDto);

      expect(result.id).toBe(existingPokemon.id);
      expect(result.name).toBe(updateDto.name);
      expect(result.type).toBe(existingPokemon.type);
      expect(service.pokemonsCache.get(id)).toEqual(result);
    });

    it('should throw NotFoundException if pokemon not found', async () => {
      const id = 9999;
      const updateDto = { name: 'Test' };

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new NotFoundException(`Not found register with id ${id}`),
        );

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {});
});
