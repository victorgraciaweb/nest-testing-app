import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/shared/dtos/pagination.dto';
import { PokeapiResponse } from './interfaces/pokeapi.response';
import { Pokemon } from './entities/pokemon.entity';
import { PokeapiPokemonResponse } from './interfaces/pokeapi-pokemon.reponse';

@Injectable()
export class PokemonsService {
  paginatedPokemonsCache = new Map<string, Pokemon[]>();
  pokemonsCache = new Map<number, Pokemon>();

  create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    const pokemon: Pokemon = {
      ...createPokemonDto,
      id: new Date().getTime(),
      hp: createPokemonDto.hp ?? 0,
      sprites: createPokemonDto.sprites ?? [],
    };

    this.pokemonsCache.forEach((storedPokemon) => {
      if (storedPokemon.name === pokemon.name) {
        throw new BadRequestException(
          `Pokemon with name ${storedPokemon.name} already exists`,
        );
      }
    });

    this.pokemonsCache.set(pokemon.id, pokemon);

    return Promise.resolve(pokemon);
  }

  async findAll(paginationDto: PaginationDto): Promise<Pokemon[]> {
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const cacheKey = `${limit}-${page}`;
    if (this.paginatedPokemonsCache.has(cacheKey)) {
      return this.paginatedPokemonsCache.get(cacheKey)!;
    }

    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

    const response = await fetch(url);
    const data = (await response.json()) as PokeapiResponse;

    const pokemonPromises = data.results.map((result) => {
      const url = result.url;
      const id = url.split('/').at(-2)!;

      return this.getPokemonInformation(+id);
    });

    const pokemons = await Promise.all(pokemonPromises);

    this.paginatedPokemonsCache.set(cacheKey, pokemons);

    return pokemons;
  }

  async findOne(id: number): Promise<Pokemon> {
    if (this.pokemonsCache.has(id)) {
      const cached = this.pokemonsCache.get(id);
      if (cached) return cached;
    }

    const pokemon = await this.getPokemonInformation(id);

    this.pokemonsCache.set(pokemon.id, pokemon);

    return pokemon;
  }

  async update(
    id: number,
    updatePokemonDto: UpdatePokemonDto,
  ): Promise<Pokemon> {
    const pokemon = await this.findOne(id);

    const pokemonUpdated: Pokemon = {
      ...pokemon,
      ...updatePokemonDto,
    };

    this.pokemonsCache.set(id, pokemonUpdated);

    return Promise.resolve(pokemonUpdated);
  }

  async remove(id: number): Promise<string> {
    await this.findOne(id);

    this.pokemonsCache.delete(id);

    return Promise.resolve(`Pokemon removed`);
  }

  private async getPokemonInformation(id: number): Promise<Pokemon> {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

    if (response.status === 404) {
      throw new NotFoundException(`Not found register with id ${id}`);
    }

    const data = (await response.json()) as PokeapiPokemonResponse;

    return {
      id: data.id,
      name: data.name,
      type: data.types[0].type.name,
      hp: data.stats[0].base_stat,
      sprites: [data.sprites.front_default, data.sprites.back_default],
    };
  }
}
