import { Pokemon } from './pokemon.entity';
describe('Pokemon', () => {
  it('Should create a Pokemon', () => {
    const pokemon = new Pokemon();
    pokemon.id = 1;
    pokemon.name = 'test';
    pokemon.type = 'Electricidad';
    pokemon.hp = 23;
    pokemon.sprites = ['Test', 'Test'];

    expect(pokemon).toMatchObject({
      id: 1,
      name: 'test',
      type: 'Electricidad',
      hp: 23,
      sprites: ['Test', 'Test'],
    });
  });
});
