import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UAParser } from 'ua-parser-js';
import rateLimit from 'express-rate-limit';
import { rateLimitCount } from './util.constant';

export const checkForRequiredFields = (
  requiredFields: string[],
  requestPayload: any,
): void => {
  const missingFields = requiredFields.filter(
    (field: string) =>
      Object.keys(requestPayload).indexOf(field) < 0 ||
      Object.values(requestPayload)[
        Object.keys(requestPayload).indexOf(field)
      ] === '',
  );
  if (missingFields.length) {
    throw new BadRequestException(
      `Missing required field(s): '${[...missingFields]}'`,
    );
  }
};

export const compareEnumValues = (value: string, checkAgainst: string[]) => {
  return checkAgainst.includes(value);
};

export const compareEnumValueFields = (
  value: string,
  checkAgainst: string[],
  fieldName?: string,
): void => {
  if (!compareEnumValues(value, checkAgainst)) {
    const message = `Field '${
      fieldName ?? value
    }' can only contain values: ${checkAgainst}`;
    throw new BadRequestException(message);
  }
};

export const validateEmail = (email: string): boolean => {
  const regExp =
    /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return regExp.test(email);
};

export const validateEmailField = (email: string): void => {
  if (!validateEmail(email)) {
    throw new BadRequestException('Email has invalid format');
  }
};

export const validatePassword = (password: string): void => {
  // Regular expressions to check for the specified conditions
  const lengthRegex = /.{8,}/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  // Check if all conditions are met
  const isLengthValid = lengthRegex.test(password);
  const hasUppercase = uppercaseRegex.test(password);
  const hasLowercase = lowercaseRegex.test(password);
  const hasNumber = numberRegex.test(password);
  const hasSpecialChar = specialCharRegex.test(password);

  // Return true if all conditions are met, otherwise false
  const message =
    'Password must contain at least 8 characters, at least 1 capital letter, 1 number and 1 special character';

  if (
    !(
      isLengthValid &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar
    )
  ) {
    throw new BadRequestException(message);
  }
};

export const hashPassword = async (rawPassword: string): Promise<string> => {
  return await new Promise((resolve, reject) => {
    bcrypt.hash(rawPassword, 10, (err, hash) => {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });
};

export const getIdentity = (
  req: any,
): { clientIp: string; deviceInfo: string } => {
  const parser = new UAParser(req.headers['user-agent']); // Get device info
  const deviceInfo = `${parser.getBrowser().name} on ${parser.getOS().name} (${parser.getDevice().model || 'Unknown Device'})`;
  let clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
  clientIp = clientIp.includes('::ffff:')
    ? clientIp.split('::ffff:')[1]
    : clientIp;
  console.log('Client IP:', clientIp, 'Device', deviceInfo);
  return { clientIp, deviceInfo };
};

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(`${rateLimitCount}`, 10),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
