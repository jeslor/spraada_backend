import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export default class PrismaService extends PrismaClient {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  //delete all the data from all tables in the database
  async clearDatabase() {
    await this.$transaction([
      this.user.deleteMany(),
      this.profile.deleteMany(),
      this.listing.deleteMany(),
      this.booking.deleteMany(),

      // Add other models as needed
    ]);
  }
}
