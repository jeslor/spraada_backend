import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  getHome(): { message: string } {
    return { message: 'Welcome to the Spraada Backend API!' };
  }
}
