import { PokemonsModule } from './pokemons/pokemons.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let pokemonsModule: PokemonsModule;
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    pokemonsModule = moduleRef.get<PokemonsModule>(PokemonsModule);
    appController = moduleRef.get<AppController>(AppController);
    appService = moduleRef.get<AppService>(AppService);
  });

  it('Should be defined with proper elements', () => {
    expect(pokemonsModule).toBeDefined();
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });
});
