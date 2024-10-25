import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { AxiosHeaders } from 'axios';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  public async forwardRequest(request: Request) {
    const requestHeaders = this.convertRequestHeaders(request.headers);

    const targetUrl = requestHeaders['x-proxy-target-url'];

    if (!targetUrl) throw new Error('X-Proxy-Target-Url Missing');

    const headers = this.getHeadersForRequest(requestHeaders);

    try {
      return await this.httpService.axiosRef.get(targetUrl, { headers });
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  private getHeadersForRequest(headers: any): any {
    return {
      authority: 'www.linkedin.com',
      accept: 'application/vnd.linkedin.normalized+json+2.1',
      'accept-language': 'en-US,en;q=0.9',
      cookie: headers['cookie'] as string,
      'csrf-token': headers['csrf-token'] as string,
      referer:
        'https://www.linkedin.com/search/results/people/?geoUrn=%5B%22106057199%22%2C%22102713980%22%2C%22103644278%22%5D&keywords=React%20and%20no%20react&origin=FACETED_SEARCH&sid=sN7',
      'sec-ch-ua':
        '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'x-li-lang': 'en_US',
      'x-li-page-instance':
        'urn:li:page:d_flagship3_search_srp_people_load_more;BniepwrcTam1NQiP+ap8zg==',
      'x-li-pem-metadata': 'Voyager - People SRP=search-results',
      'x-li-track':
        '{"clientVersion":"1.13.11186","mpVersion":"1.13.11186","osName":"web","timezoneOffset":-5,"timezone":"America/New_York","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":1,"displayWidth":1920,"displayHeight":1080}',
      'x-restli-protocol-version': '2.0.0',
    };
  }

  private convertRequestHeaders(headers: Record<string, any>) {
    const axiosHeaders = new AxiosHeaders();

    for (const [key, value] of Object.entries(headers)) {
      if (Array.isArray(value)) axiosHeaders.set(key, value.join(', '));
      else if (typeof value === 'string') axiosHeaders.set(key, value);
      else if (value !== undefined) axiosHeaders.set(key, String(value));
    }

    return axiosHeaders;
  }
}
