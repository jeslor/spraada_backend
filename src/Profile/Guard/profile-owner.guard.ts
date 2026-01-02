import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import PrismaService from 'src/prisma/prisma.service';

/**
 * Guard that checks if the current user is the owner of a profile OR has ADMIN role.
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, ProfileOwnerGuard)
 * @Patch(':id')
 * update(@Param('id') id: string, @Body() dto: UpdateProfileDto) { ... }
 *
 * Expects:
 * - JWT user in request.user with { id: userId, role: Role }
 * - Profile ID in request.params.id or request.params.profileId or request.params.userId
 */
@Injectable()
export class ProfileOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must be authenticated
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admins can access any profile
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Get profile ID from route params
    const profileId =
      request.params.id || request.params.profileId || request.params.userId;

    if (!profileId) {
      throw new ForbiddenException('Profile ID is required');
    }

    // Handle both profile ID and user ID lookups
    const parsedId = parseInt(profileId, 10);

    if (isNaN(parsedId)) {
      throw new ForbiddenException('Invalid profile ID');
    }

    // First try to find by profile ID
    let profile = await this.prisma.profile.findUnique({
      where: { id: parsedId },
      select: { userId: true },
    });

    // If not found, try by user ID (for routes like /profile/:userId)
    if (!profile) {
      profile = await this.prisma.profile.findUnique({
        where: { userId: parsedId },
        select: { userId: true },
      });
    }

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check if user owns the profile
    if (profile.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this profile',
      );
    }

    return true;
  }
}
