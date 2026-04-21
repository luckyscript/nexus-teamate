import { Injectable, Scope, ScopeEnum, Config } from '@midwayjs/core';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: number;
  tenantId: number;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
@Scope(ScopeEnum.Singleton)
export class JwtService {
  @Config('jwt')
  jwtConfig: { secret: string; expiresIn: string };

  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtConfig.secret, {
      expiresIn: this.jwtConfig.expiresIn || '7d',
    });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtConfig.secret) as JwtPayload;
    } catch {
      throw new Error('INVALID_TOKEN');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  refreshToken(token: string): string {
    const payload = this.verifyToken(token);
    const { iat, exp, ...rest } = payload;
    return this.generateToken(rest);
  }
}
