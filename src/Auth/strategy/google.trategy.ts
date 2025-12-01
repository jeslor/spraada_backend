import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import googleOathConfig from '../config/googleOath.config';
import type { ConfigType } from '@nestjs/config';
import AuthService from '../Auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOathConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleOathConfig>,
    private readonly authService: AuthService,
  ) {
    const { clientID, clientSecret, callbackURL } = googleConfig;
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  //come back here when the google login doesn't work
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;
    let user = await this.authService.validateGoogleLogin({
      email: emails[0].value,
      password: '',
      confirmPassword: '',
    });

    done(null, user);

    return {
      id: user.id,
      email: user.email,
      access_token: user.access_token,
      refresh_token: user.refresh_token,
    };
  }
}
