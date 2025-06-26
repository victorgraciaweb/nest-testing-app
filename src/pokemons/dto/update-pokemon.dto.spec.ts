import 'reflect-metadata';
import { validate } from 'class-validator';
import { UpdatePokemonDto } from './update-pokemon.dto';

describe('UpdatePokemonDto', () => {
  it('Should validate with default values', async () => {
    const dto = new UpdatePokemonDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('Should validate hp is min 0', async () => {
    const dto = new UpdatePokemonDto();
    dto.hp = 1;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('Should fail if hp is not more than 0', async () => {
    const dto = new UpdatePokemonDto();
    dto.hp = -4;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('hp');
    expect(errors[0].constraints?.min).toBe('hp must not be less than 0');
  });
});
