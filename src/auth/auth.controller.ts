import { Controller, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { LoginDTO, SignupDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { response } from 'oba-http-response';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() payload: LoginDTO, @Res() res: Response) {
    try {
      const token = await this.authService.login(payload);
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
  async signup(@Body() payload: SignupDTO, @Res() res: Response) {
    try {
      await this.authService.signup(payload);
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
