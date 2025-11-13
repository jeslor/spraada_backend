import { Injectable } from '@nestjs/common';
import { SigninDto } from './dto';

@Injectable()
export default class AuthService {
  signIn(dto: SigninDto) {
    console.log(dto, 'in auth service');
  }
}
