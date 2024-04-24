import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor (
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log('UserRoleGuard');

    const ValidRoles: string[] = this.reflector.get('roles', context.getHandler() );
    // console.log({ValidRoles});
    if (!ValidRoles) return true;
    if (ValidRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) 
      throw new BadRequestException('User not found (roleGuard)');

    // console.log({userRoles: user.roles});
    for (const role of user.roles) {
      if (ValidRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${ValidRoles}].`
    );
  }
}
