import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreatePokemonDto } from './create-pokemon.dto';

describe('CreatePokemonDto', () => {
  it('Should validate with default values', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pokemon';
    dto.type = 'agua';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('Should fail if name is missing', async () => {
    const dto = new CreatePokemonDto();
    dto.type = 'agua';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
  });

  it('Should fail if type is missing', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pokemon';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('type');
  });

  it('Should validate hp is min 0', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pokemon';
    dto.type = 'agua';
    dto.hp = 1;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('Should fail if hp is not more than 0', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pokemon';
    dto.type = 'agua';
    dto.hp = -4;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('hp');
    expect(errors[0].constraints?.min).toBe('hp must not be less than 0');
  });

  it('Should fail if hp is a string', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pokemon';
    dto.type = 'agua';
    dto.hp = 'invalid' as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('hp');
    expect(errors[0].constraints?.isNumber).toBeDefined();
  });

  it('Should validate sprites as array of strings', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pokemon';
    dto.type = 'fuego';
    dto.sprites = ['Test', 'Test'];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should fail if sprites contains non-string values', async () => {
    const dto = new CreatePokemonDto();
    dto.name = 'Pokemon';
    dto.type = 'agua';
    dto.sprites = ['url1', 123 as any];

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('sprites');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
