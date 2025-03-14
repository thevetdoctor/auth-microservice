import {
  All,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiProduces,
  ApiBody,
  ApiParam,
  getSchemaPath,
  ApiExtraModels,
  ApiSecurity,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthController } from './auth/auth.controller';
import { ModuleRef } from '@nestjs/core';
import { LoginDTO, SignupDTO } from './auth/auth.dto';
import { feedbackServiceUrl, mailServiceUrl } from './utils';
import { response } from 'oba-http-response';
import { ApiKeyGuard } from './guards/apikey.guard';
const axios = require('axios');

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly httpService: HttpService,
    private moduleRef: ModuleRef,
  ) {}

  @Get()
  getHello(): { message: string } {
    return this.appService.getHello();
  }

  @ApiSecurity('x-api-key')
  @UseGuards(ApiKeyGuard)
  @ApiParam({
    name: 'route',
    required: true,
    description: 'Dynamic path for routing',
  })
  @ApiExtraModels(LoginDTO, SignupDTO)
  // @ApiBody({ type: LoginDTO, required: false })
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(SignupDTO) },
        { $ref: getSchemaPath(LoginDTO) },
      ],
    },
    required: false,
  })
  @ApiOperation({ summary: 'Handles all requests' })
  @ApiResponse({ status: 200, description: 'Fallback response' })
  @All(':route')
  async proxy(
    @Req() req: Request,
    @Param('route') route: string,
    @Res() res: Response,
  ) {
    const { method, url, body } = req;
    const { 'content-length': _, ...filteredHeaders } = req.headers;

    // Define internal routes
    const internalRoutes = ['auth', 'auth/login', 'auth/signup'];

    if (internalRoutes.includes(route)) {
      // Define route mappings to controllers (internal)
      const routeMap = {
        'auth': AuthController,
        // '/users': UsersController,
        // '/orders': OrdersController,
      };
      console.log('url', url);
      // Find the appropriate controller based on the route prefix
      const controllerKey = Object.keys(routeMap).find((prefix) =>
        url.startsWith(prefix),
      );

      if (!controllerKey) {
        return res.status(404).json({ message: 'Route not found' });
      }

      // Get the controller instance from NestJS module reference
      const controller = this.moduleRef.get(routeMap[controllerKey], {
        strict: false,
      });

      try {
        // Determine the correct method inside the controller based on the request
        const handlerMethod = controller.handleRequest; // This should be implemented in each controller

        if (typeof handlerMethod !== 'function') {
          return res.status(400).json({ message: 'Invalid route handler' });
        }

        // Call the controller method dynamically
        await handlerMethod.call(controller, method, route, body, req, res);
      } catch (e) {
        console.error('Internal request failed:', e);
        throw e;
      }
    } else {
      // Define external microservices mapping
      const routeMap = {
        'mail': mailServiceUrl,
        'feedback': mailServiceUrl,
      };

      // Find matching external service
      const serviceUrl = Object.keys(routeMap).find((prefix) =>
        url.startsWith(prefix),
      );

      if (!serviceUrl) {
        throw new HttpException('Route not found', HttpStatus.NOT_FOUND);
      }

      const targetUrl = `${routeMap[serviceUrl]}/${route.split('/')[1]}`;
      console.log('url', url, route, targetUrl, method, body);

      // Forward the request externally
      try {
        const response = await firstValueFrom(
          this.httpService.request({
            method,
            url: targetUrl,
            data: body,
            headers: filteredHeaders,
            timeout: 5000,
          }),
        );
        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED' || error.response?.status === 408) {
            // Timeout or explicit 408 error
            return response(
              res,
              HttpStatus.REQUEST_TIMEOUT,
              null,
              'Request timed out. Please try again later',
            );
          } else if (error.response) {
            // The request was made and the server responded with a status code
            return response(
              res,
              error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
              null,
              error.response.data?.message || error.response.data?.error
                ? error.response.data?.error
                : 'External service error',
            );
          } else if (error.request) {
            // The request was made but no response was received
            return response(
              res,
              HttpStatus.SERVICE_UNAVAILABLE,
              null,
              'No response from external service',
            );
          } else {
            // Something happened in setting up the request that triggered an error
            return response(
              res,
              HttpStatus.INTERNAL_SERVER_ERROR,
              null,
              error.message || 'Internal request error',
            );
          }
        } else {
          // Non-Axios error (e.g., network issue, unexpected error)
          return response(
            res,
            HttpStatus.INTERNAL_SERVER_ERROR,
            null,
            'Unexpected error occurred',
          );
        }
      }
    }
  }
}
