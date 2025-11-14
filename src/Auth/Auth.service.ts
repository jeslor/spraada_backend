import { Injectable } from '@nestjs/common';
import { SigninDto } from './dto';

@Injectable()
export default class AuthService {
  signIn(dto: SigninDto) {
    console.log(dto, 'in auth service');
    return JSON.stringify({
      message: 'Hello, you reached the auth sign-in page',
    });
  }
}
