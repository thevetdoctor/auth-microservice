import { Controller, Post, Body, HttpStatus, Res, Req } from '@nestjs/common';
import { LoginDTO, SignupDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { response } from 'oba-http-response';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() payload: LoginDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
      console.log('Client IP:', clientIp);
      const token = await this.authService.login(payload, clientIp);
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
  async signup(@Body() payload: SignupDTO, @Req() req: Request, @Res() res: Response) {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
      console.log('Client IP:', clientIp);
      await this.authService.signup(payload, clientIp);
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
        e.response.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        null,
        e.message,
      );
    }
  }
}
