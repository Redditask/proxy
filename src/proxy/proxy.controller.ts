import { All, Controller, Req, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Request, Response } from 'express';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  public async forwardRequest(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const forwardResponse = await this.proxyService.forwardRequest(request);

      response.status(forwardResponse.status).send(forwardResponse.data);
    } catch (error) {
      response
        .status(error.response?.status ?? 500)
        .send(error.response?.data ?? 'Proxy Server Error');
    }
  }
}
