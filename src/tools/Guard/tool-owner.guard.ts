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
 * Guard that checks if the current user is the owner of a tool OR has ADMIN role.
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, ToolOwnerGuard)
 * @Patch(':id')
 * update(@Param('id') id: string, @Body() dto: UpdateToolDto) { ... }
 *
 * Expects:
 * - JWT user in request.user with { id: userId, role: Role }
 * - Tool ID in request.params.id or request.params.toolId
 */
@Injectable()
export class ToolOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must be authenticated
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admins can access any tool
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Get tool ID from route params
    const toolId = request.params.id || request.params.toolId;

    if (!toolId) {
      throw new ForbiddenException('Tool ID is required');
    }

    // Fetch the tool to check ownership
    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
      select: { profileId: true },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    // Get user's profile to compare
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      throw new ForbiddenException('User profile not found');
    }

    // Check if user owns the tool
    if (tool.profileId !== profile.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this tool',
      );
    }

    return true;
  }
}
