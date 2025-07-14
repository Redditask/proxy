import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly httpService: HttpService,
  ) {}

  @Get()
  public async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Get('proxy')
  public async proxy(@Res() response: Response, @Req() request: Request) {
    const {
      ['x-target-url']: targetUrl,
      host,
      connection,
      ['accept-encoding']: _,
      ...forwardHeaders
    } = request.headers as any;

    try {
      const forwardResponse = await this.httpService.axiosRef.get(targetUrl, {
        headers: forwardHeaders,
        timeout: 2 * 60 * 1000,
      });

      response.set(forwardResponse.headers).send(forwardResponse.data);
    } catch (error: any) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data || error.message;

      response.status(status).send(message);
    }
  }
}
