import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';

export default registerAs(
  'refresh-jwt-token',
  (): JwtSignOptions => ({
    secret: process.env.JWT_REFRESH_TOKEN,
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue,
  }),
);
