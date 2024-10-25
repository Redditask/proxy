import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public async getHello(): string {
    return 'Hello World!';
  }
}
