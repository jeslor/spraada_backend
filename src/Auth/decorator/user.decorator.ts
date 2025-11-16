import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new Error(
        'User not found in request. Ensure JWT Guard is applied.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
