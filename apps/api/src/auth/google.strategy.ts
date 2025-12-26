import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });

    const proxy = this.configService.get<string>('HTTP_PROXY');
    if (proxy) {
      const agent = new HttpsProxyAgent(proxy);
      this._oauth2.setAgent(agent);
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      const user = {
        email: emails && emails.length > 0 ? emails[0].value : null,
        firstName: name ? name.givenName : '',
        lastName: name ? name.familyName : '',
        picture: photos && photos.length > 0 ? photos[0].value : '',
        accessToken,
      };
      
      if (!user.email) {
          throw new Error('No email found from Google Login');
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
