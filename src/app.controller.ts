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
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthController } from './auth/auth.controller';
import { ModuleRef } from '@nestjs/core';
import { LoginDTO, SignupDTO } from './auth/auth.dto';
import { feedbackServiceUrl, mailServiceUrl } from './utils';
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
        '/auth': AuthController,
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
          console.log(
            'inter',
            url,
            route,
            routeMap[controllerKey],
            handlerMethod,
            controller,
          );
          return res.status(400).json({ message: 'Invalid route handler' });
        }

        // Call the controller method dynamically
        await handlerMethod.call(controller, method, route, body, req, res);
      } catch (error) {
        console.error('Internal request failed:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      // Define external microservices mapping
      const routeMap = {
        '/mail': mailServiceUrl,
        '/feedback': feedbackServiceUrl,
      };

      // Find matching external service
      const serviceUrl = Object.keys(routeMap).find((prefix) =>
        url.startsWith(prefix),
      );

      if (!serviceUrl) {
        throw new HttpException('Route not found', HttpStatus.NOT_FOUND);
      }

      const targetUrl = `${routeMap[serviceUrl]}${''}`;
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
        res.status(response.status).json(response.data);
      } catch (error) {
        console.log('error', error.message);
        if (axios.isAxiosError(error)) {
          console.error('Axios Error:', error.message);

          if (error.code === 'ECONNABORTED' || error.response?.status === 408) {
            // Timeout or explicit 408 error
            console.error('Request timeout:', error.config?.url);
            res.status(408).json({
              message: 'Request timed out. Please try again later.',
              statusCode: 408,
            });
          } else if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).json({
              message: error.response.data?.message || 'External service error',
              statusCode: error.response.status,
              data: error.response.data,
            });
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            res.status(502).json({
              message: 'No response from external service',
              statusCode: 502,
            });
          } else {
            // Something happened in setting up the request that triggered an error
            console.error('Request setup error:', error.message);
            res.status(500).json({
              message: 'Internal request error',
              statusCode: 500,
            });
          }
        } else {
          // Non-Axios error (e.g., network issue, unexpected error)
          console.error('Unexpected Error:', error);
          res.status(500).json({
            message: 'Unexpected error occurred',
            statusCode: 500,
          });
        }
      }
    }
  }
}
