import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';

describe('Pokemons (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  describe('create', () => {
    it('/pokemon (POST) - should create a pokemon with no body', async () => {
      const response = await request(app.getHttpServer()).post('/pokemons');

      const mostHaveErrorMessage = [
        'name must be a string',
        'name should not be empty',
        'type must be a string',
        'type should not be empty',
      ];

      const meesageArray: string = response.body.message ?? [];

      expect(response.statusCode).toEqual(400);
      expect(meesageArray.length).toEqual(mostHaveErrorMessage.length);
      expect(meesageArray).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });

    it('/pokemon (POST) - should create a pokemon with valid body', async () => {
      const createDto = {
        name: 'Pikachu',
        type: 'Electric',
        hp: 35,
        sprites: ['sprite1.png', 'sprite2.png'],
      };

      const response = await request(app.getHttpServer())
        .post('/pokemons')
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(createDto);
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('number');
    });

    it('/pokemon (POST) - should return error with no valid type and not empty', async () => {
      const createDto = {
        name: 'Pikachu',
        type: 99,
      };

      const mostHaveErrorMessage = ['type must be a string'];

      const response = await request(app.getHttpServer())
        .post('/pokemons')
        .send(createDto);

      const meesageArray: string = response.body.message ?? [];

      expect(response.status).toBe(400);
      expect(meesageArray).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });
  });

  describe('findAll', () => {
    it('/pokemon (GET) - should return 10 pokemon without paginated', async () => {
      const response = await request(app.getHttpServer()).get('/pokemons');

      expect(response.statusCode).toEqual(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toEqual(10);
      expect(response.body[0]).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        type: expect.any(String),
        hp: expect.any(Number),
        sprites: expect.any(Array),
      });
    });

    it('/pokemon (GET) - should return 15 pokemon with paginated', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemons')
        .query({ limit: 15, page: 2 });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toEqual(15);
      expect(response.body[0]).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        type: expect.any(String),
        hp: expect.any(Number),
        sprites: expect.any(Array),
      });
    });
  });

  describe('findOne', () => {
    it('/pokemon/:id (GET) - should pokemon by ID', async () => {
      const id = 34;
      const response = await request(app.getHttpServer()).get(
        `/pokemons/${id}`,
      );

      const pokemon = response.body as Pokemon;

      expect(response.statusCode).toEqual(200);
      expect(pokemon).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        type: expect.any(String),
        hp: expect.any(Number),
        sprites: expect.any(Array),
      });
    });

    it('/pokemon/:id (GET) - should return not found', async () => {
      const id = 10000000;
      const response = await request(app.getHttpServer()).get(
        `/pokemons/${id}`,
      );

      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual({
        message: `Not found register with id ${id}`,
        error: 'Not Found',
        statusCode: 404,
      });
    });
  });
});
