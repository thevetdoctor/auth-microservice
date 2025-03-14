import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApikeyService } from 'src/apikey/apikey.service';
import { response } from 'oba-http-response';
import { Response } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apikeyService: ApikeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    try {
      const apiKey = request.headers['x-api-key'];

      // this.apikeyService.generateApiKey('72e92164-fc49-4bed-a18c-83db2913533d').then(val => {
      //   return val;
      // });

      if (!apiKey) {
        throw new UnauthorizedException('Protected Route');
      }
      console.log('(x-api-key)', apiKey);
      const validKey = await this.apikeyService.validateApiKey(apiKey);
      console.log(apiKey, validKey ? 'valid' : 'invalid');

      if (!validKey) {
        throw new UnauthorizedException('Invalid Authorization: API Key');
      }
      // Attach the user ID to the request for further processing
      request.user = { id: validKey.userId };

      return true;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
