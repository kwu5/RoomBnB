import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (payload: { id: string; email: string; isHost: boolean }): string => {
  const secret = config.jwt.secret;
  const expiresIn = config.jwt.expiresIn;
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt.secret);
};
