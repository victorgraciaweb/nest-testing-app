import { AppService } from './app.service';

describe('AppService', () => {
  it('Should be called getHello function', () => {
    const appService = new AppService();

    const result = appService.getHello();

    expect(result).toEqual('Hello World!');
  });
});
