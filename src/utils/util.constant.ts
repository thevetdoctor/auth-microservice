import * as dotenv from 'dotenv';
dotenv.config();

export const SEQUELIZE = 'SEQUELIZE';
export const DEVELOPMENT = 'development';
export const TEST = 'test';
export const PRODUCTION = 'production';
export const PERMISSION_REPOSITORY = 'PERMISSION_REPOSITORY';
export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';
export const USER_ROLE_REPOSITORY = 'USER_ROLE_REPOSITORY';
export const ROLE_PERMISSION_REPOSITORY = 'ROLE_PERMISSION_REPOSITORY';
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const BLACKLISTED_TOKENS = 'BLACKLISTED_TOKENS';
export const TWO_FACTOR_TOKEN_REPOSITORY = 'TWO_FACTOR_TOKEN_REPOSITORY';
export const RESET_TOKEN_REPOSITORY = 'RESET_TOKEN_REPOSITORY';
export const APIKEY_REPOSITORY = 'APIKEY_REPOSITORY';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

// ENV Variables
export const appName = process.env.APP_NAME ?? 'AUTH_MICROSERVICE';
export const rateLimitCount = process.env.RATE_LIMIT ?? '20';
export const adminEmail = process.env.ADMIN_EMAIL ?? 'thevetdoctor@gmail.com';
export const mailServiceUrl =
  process.env.MAIL_SERVICE_URL ?? 'http://178.128.32.101:3100';
export const feedbackServiceUrl =
  process.env.FEEDBACK_SERVICE_URL ?? 'http://178.128.32.101:3200';
export const kafkaUrl = process.env.KAFKA_URL ?? '104.248.162.129:9092';
export const dbUrl = process.env.DB_URL ?? '';
export const env = process.env.NODE_ENV ?? '';
export const jwtSecret =
  process.env.JWT_SECRET ?? 'auth-microservice-secret-key';
export const expiryDuration = process.env.JWT_DURATION_EXPIRY
  ? String(process.env.JWT_DURATION_EXPIRY)
  : '1h';
export const internalRoutes = process.env.INTERNAL_ROUTES ?? [];
export const port = process.env.PORT ?? 3001;

export enum AppRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum NodeEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum KafkaTopics {
  MAIL_SENT = 'mail.sent',
  USER_LOGIN = 'user.login',
  USER_LOGIN_ERROR = 'user.login.error',
  USER_LOGIN_ERROR_ALERT = 'user.login.error.alert',
  USER_SIGNUP = 'user.signup',
  USER_SIGNUP_ERROR = 'user.signup.error',
}
