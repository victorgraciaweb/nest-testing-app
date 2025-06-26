import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { PaginationDto } from './pagination.dto';

describe('PaginationDTO', () => {
  it('Should validate with default values', async () => {
    const dto = new PaginationDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should validate with valid data', async () => {
    const dto = new PaginationDto();
    dto.limit = 5;
    dto.page = 3;
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('Should validate with invalid limit', async () => {
    const dto = new PaginationDto();
    dto.limit = -2;
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('limit');
    expect(errors[0].constraints?.min).toBe('limit must not be less than 1');
  });

  it('Should validate with invalid page', async () => {
    const dto = new PaginationDto();
    dto.page = -5;
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('page');
    expect(errors[0].constraints?.min).toBe('page must not be less than 1');
  });

  it('Should convert string to number', async () => {
    const input = { limit: '10', page: '4' };
    const dto = plainToInstance(PaginationDto, input);

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(10);
    expect(dto.page).toBe(4);
  });
});
