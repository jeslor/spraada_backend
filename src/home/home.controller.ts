import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import { get } from 'http';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  getHome(): {
    message: string;
  } {
    return this.homeService.getHome();
  }
}
