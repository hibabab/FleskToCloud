/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Log request headers for debugging
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('Request headers:', request.headers);

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.log('No token provided'); // Log when no token is provided
      throw new Error('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.userId = decoded.sub; // Assurez-vous que l'utilisateur est attaché à la requête
      console.log('Token decoded successfully:', decoded); // Log decoded token
      return true;
    } catch (error) {
      console.log('Invalid token:', error); // Log error when token is invalid
      throw new Error('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const authorization = request.headers['authorization'];
    if (!authorization) {
      console.log('Authorization header is missing'); // Log when Authorization header is missing
      throw new Error('Authorization header is missing');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer' || !token) {
      console.log('Invalid token format'); // Log if token format is incorrect
      throw new Error('Invalid token format');
    }
    console.log('Token extracted:', token); // Log extracted token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return token;
  }
}
