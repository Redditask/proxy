import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller()
export class AppController {
  private input: number;
  private output: number;

  constructor(
    private readonly appService: AppService,
    private readonly httpService: HttpService,
  ) {
    this.input = 0;
    this.output = 0;
  }

  @Cron(CronExpression.EVERY_5_MINUTES, { timeZone: 'Europe/Minsk' })
  public resetStatistic() {
    this.input = 0;
    this.output = 0;
  }

  @Get()
  public async getStatistics() {
    return await this.appService.getStatistics(this.input, this.output);
  }

  @Get('proxy')
  public async proxy(@Res() response: Response, @Req() request: Request) {
    this.input++;

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

      this.output++;
      response.set(forwardResponse.headers).send(forwardResponse.data);
    } catch (error: any) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data || error.message;

      this.output++;
      response.status(status).send(message);
    }
  }
}
