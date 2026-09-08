import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// A "strategy" is Passport's term for one specific way of authenticating a
// request. This one: look for "Authorization: Bearer <token>", verify the
// token's signature, and if valid, hand back the decoded payload — which
// becomes `request.user` in any protected route.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // In a real deployment this secret comes from an environment
      // variable set outside the codebase (never hardcode a real secret
      // in a repo). For this demo it's set in AuthModule below via env.
      secretOrKey: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
    });
  }

  validate(payload: { sub: string; email: string }) {
    // Whatever this returns becomes `request.user` on protected routes.
    return { userId: payload.sub, email: payload.email };
  }
}