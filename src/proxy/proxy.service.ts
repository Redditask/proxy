import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { AxiosHeaders, AxiosRequestConfig } from 'axios';
import { Agent } from 'https';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  public async forwardRequest(request: Request) {
    const headers = this.convertHeadersToAxios(request.headers);

    const targetUrl = headers['x-proxy-target-url'];

    if (!targetUrl) throw new Error('X-Proxy-Target-Url Missing');

    headers.delete('x-proxy-target-url');

    const config: AxiosRequestConfig = {
      headers,
      url: targetUrl,
      method: request.method,
      data: request.body,
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    };

    console.log(config); //todo delete

    try {
      return await this.httpService.axiosRef.request(config);
    } catch (error) {
      console.log(error); //todo delete

      throw error;
    }
  }

  private convertHeadersToAxios(headers: Record<string, any>) {
    const axiosHeaders = new AxiosHeaders();

    for (const [key, value] of Object.entries(headers)) {
      if (Array.isArray(value)) axiosHeaders.set(key, value.join(', '));
      else if (typeof value === 'string') axiosHeaders.set(key, value);
      else if (value !== undefined) axiosHeaders.set(key, String(value));
    }

    return axiosHeaders;
  }
}
