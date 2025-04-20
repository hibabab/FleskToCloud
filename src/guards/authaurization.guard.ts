/*import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth/auth.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionDto } from '../role/dtos/permission.dto'; // Assurez-vous de l'import correct des Permissions

interface RequestWithUserId extends Request {
  userId?: number; // ou le type approprié pour userId
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUserId = context.switchToHttp().getRequest();

    // Vérifier si l'utilisateur est authentifié
    if (!request.userId) {
      throw new UnauthorizedException('User Id not found');
    }

    // Récupérer les permissions associées à la route
    const routePermissions: PermissionDto[] = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si aucune permission spécifique n'est définie pour cette route, on autorise l'accès
    if (!routePermissions || routePermissions.length === 0) {
      return true;
    }

    try {
      // Récupérer les permissions de l'utilisateur
      const userPermissions = await this.authService.getUserPermissions(
        request.userId,
      );

      // Vérifier que l'utilisateur possède les permissions nécessaires pour chaque ressource
      for (const routePermission of routePermissions) {
        const userPermission = userPermissions.find(
          (perm) => perm.resource === routePermission.resource,
        );

        // Si l'utilisateur n'a pas de permission pour la ressource, on rejette l'accès
        if (!userPermission) {
          throw new ForbiddenException(
            `Permission for resource ${routePermission.resource} not found`,
          );
        }

        // Vérifier que l'utilisateur a toutes les actions nécessaires sur cette ressource
        const hasRequiredActions = routePermission.actions.every(
          (requiredAction) => userPermission.actions.includes(requiredAction),
        );

        if (!hasRequiredActions) {
          throw new ForbiddenException(
            `User does not have all required actions for resource ${routePermission.resource}`,
          );
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // En cas d'erreur, on rejette l'accès
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
*/
