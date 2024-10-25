import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { AxiosHeaders, AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  public async forwardRequest(request: Request) {
    const headers = this.convertHeadersToAxios(request.headers);

    const targetUrl = headers['x-proxy-target-url'];

    if (!targetUrl) throw new Error('X-Proxy-Target-Url Missing');

    headers.delete('x-proxy-target-url');
    headers.delete('host');
    headers.delete('connection');
    headers.delete('accept-encoding');
    headers.set('x-li-lang', 'en_US');
    headers.set(
      'x-li-track',
      '{"clientVersion":"1.13.11186","mpVersion":"1.13.11186","osName":"web","timezoneOffset":-5,"timezone":"America/New_York","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":1,"displayWidth":1920,"displayHeight":1080}',
    );
    headers.set('accept-language', 'en-US,en;q=0.9');

    const config: AxiosRequestConfig = {
      headers,
      url: targetUrl,
      method: request.method,
      data: request.body,
    };

    try {
      return await this.httpService.axiosRef.request(config);
    } catch (error) {
      console.log(error);

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
