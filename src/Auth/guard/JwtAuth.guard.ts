import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_Public_API_ENDPOINT } from '../decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //logic for excluding the public endpoints from JWT Auth guard that we set as a global guard
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_Public_API_ENDPOINT,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;

    return super.canActivate(context);
  }
}
