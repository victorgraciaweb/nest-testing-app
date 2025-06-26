import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { PaginationDto } from '../shared/dtos/pagination.dto';
import { Pokemon } from './entities/pokemon.entity';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonsController],
      providers: [PokemonsService],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with correct data and return expected message', async () => {
    const data: CreatePokemonDto = {
      name: 'pikachu',
      type: 'electric',
    };

    jest.spyOn(service, 'create');

    await controller.create(data);

    expect(service.create).toHaveBeenCalledWith(data);
  });

  it('Should be called the service and return pokemons', async () => {
    const paginationDto: PaginationDto = { limit: 10, page: 4 };
    const pokemonMock: Pokemon[] = [
      {
        id: 1,
        name: 'bulbasaur',
        type: 'grass',
        hp: 45,
        sprites: [
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
        ],
      },
      {
        id: 2,
        name: 'ivysaur',
        type: 'grass',
        hp: 60,
        sprites: [
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png',
        ],
      },
    ];

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve(pokemonMock));

    const pokemons = await controller.findAll(paginationDto);

    expect(pokemons).toBe(pokemonMock);
    expect(service.findAll).toHaveBeenCalledWith(paginationDto);
  });

  it('Should have called findOne service with correct ID', async () => {
    const id = '2';

    const pokemonMock: Pokemon = {
      id: 2,
      name: 'ivysaur',
      type: 'grass',
      hp: 60,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png',
      ],
    };

    jest
      .spyOn(service, 'findOne')
      .mockImplementation(() => Promise.resolve(pokemonMock));

    const pokemon = await controller.findOne(id);

    expect(service.findOne).toHaveBeenCalledWith(+id);
    expect(pokemon).toBe(pokemonMock);
  });

  it('Should have called update service with correct ID and data', async () => {
    const id = '4';
    const data: UpdatePokemonDto = { type: 'agua' };

    jest.spyOn(service, 'update');

    const pokemonUpdated = await controller.update(id, data);

    expect(service.update).toHaveBeenCalledWith(+id, data);
    expect(pokemonUpdated).toEqual(`This action updates a #${id} pokemon`);
  });

  it('Should have called delete service with correct ID', async () => {
    const id = '12';

    jest.spyOn(service, 'remove');

    const pokemonRemoved = await controller.remove(id);

    expect(service.remove).toHaveBeenCalledWith(+id);
    expect(pokemonRemoved).toBe(`This action removes a #${id} pokemon`);
  });
});
