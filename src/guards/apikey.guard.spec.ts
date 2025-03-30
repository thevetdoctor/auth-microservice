import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApikeyService } from 'src/apikey/apikey.service';
import { ApiKeyGuard } from './apikey.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let mockApikeyService: Partial<ApikeyService>;

  beforeEach(() => {
    mockApikeyService = {
      validateApiKey: jest.fn().mockResolvedValue(true), // Mock a valid API key
    };

    guard = new ApiKeyGuard(mockApikeyService as ApikeyService);
  });

  function createMockExecutionContext(
    headers: Record<string, string>,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
        getResponse: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if API key is valid', async () => {
    const mockContext = createMockExecutionContext({
      'x-api-key': 'valid-key',
    });

    expect(await guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException if API key is missing', async () => {
    const mockContext = createMockExecutionContext({});

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if API key is invalid', async () => {
    mockApikeyService.validateApiKey = jest.fn().mockResolvedValue(false); // Mock invalid key
    const mockContext = createMockExecutionContext({
      'x-api-key': 'invalid-key',
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
