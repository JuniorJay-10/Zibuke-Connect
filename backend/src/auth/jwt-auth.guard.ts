import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// A Guard runs BEFORE a route handler and decides whether the request is
// allowed through at all. Attaching @UseGuards(JwtAuthGuard) to a route
// means: run the 'jwt' strategy above first; if it fails (no/invalid
// token), the request is rejected with 401 before our controller code
// ever executes.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}