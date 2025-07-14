import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async getHello(): Promise<string> {
    const caffeineResult = await this.httpService.axiosRef.get(
      `${this.configService.get('CAFFEINE_URL')}/`,
    );

    if (!!caffeineResult.data) console.log('caffeine successfully completed');

    return 'Hello World!';
  }
}
