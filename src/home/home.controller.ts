import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import { isPublicEndpoint } from 'src/Auth/decorator/public-endpoint.decorator';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @isPublicEndpoint()
  @Get()
  getHome(): {
    message: string;
  } {
    return this.homeService.getHome();
  }
}
