import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { LoginDTO, SignupDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { response } from 'oba-http-response';
import { Request, Response } from 'express';
import { getIdentity, getLocation } from 'src/utils';
import { ApiKeyGuard } from 'src/guards/apikey.guard';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('auth')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async handleRequest(
    method: string,
    url: string,
    body: any,
    req: Request,
    res: Response,
  ) {
    console.log(method, url, body);
    if (
      method === 'POST' &&
      url.startsWith('auth/') &&
      url.indexOf('login') >= 0
    ) {
      return this.login(body, req, res);
    } else if (
      method === 'POST' &&
      url.startsWith('auth/') &&
      url.indexOf('signup') >= 0
    ) {
      return this.signup(body, req, res);
    }
    return response(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      null,
      'Invalid request',
    );
  }

  @Post('login')
  async login(
    @Body() payload: LoginDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let { clientIp: ip, deviceInfo } = getIdentity(req);
      let clientIp = await getLocation(ip);
      const token = await this.authService.login(payload, clientIp, deviceInfo);
      return response(res, HttpStatus.CREATED, { ...token }, null, 'Logged in');
    } catch (e) {
      return response(
        res,
        e.response.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        null,
        e.message,
      );
    }
  }

  @Post('signup')
  async signup(
    @Body() payload: SignupDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let { clientIp: ip, deviceInfo } = getIdentity(req);
      const clientIp = await getLocation(ip);
      await this.authService.signup(payload, clientIp, deviceInfo);
      return response(
        res,
        HttpStatus.CREATED,
        null,
        null,
        'User Account created successfully',
      );
    } catch (e) {
      return response(
        res,
        e.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        null,
        e.message,
      );
    }
  }

  @Get('validate')
  async validate(@Req() req: Request, @Res() res: Response) {
    try {
      const userData = req['user'];
      return response(res, HttpStatus.OK, userData, null, 'Validated');
    } catch (e) {
      return response(
        res,
        e.response.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        null,
        e.message,
      );
    }
  }

  @Get('getlocation')
  async getLocation(@Req() req: Request, @Res() res: Response) {
    try {
      let { clientIp: ip, deviceInfo } = getIdentity(req);
      const clientIp = await getLocation(ip);
      return response(
        res,
        HttpStatus.CREATED,
        { ip, location: clientIp, deviceInfo },
        null,
        'Client details',
      );
    } catch (e) {
      return response(
        res,
        e.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        null,
        e.message,
      );
    }
  }
}
