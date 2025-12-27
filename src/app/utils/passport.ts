import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { authServices } from '../modules/auth/auth.service';
// import { Strategy as FacebookStrategy } from 'passport-facebook';
// import app from '../../app';
// import AppError from '../error/AppError';
import AppleStrategy from 'passport-apple';
import config from '../config';

// // // Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: config.social.google_client_id as string,
//       clientSecret: config.social.google_client_secret as string,
//       callbackURL: 'http://localhost:1000/api/v1/auth/google/callback',
//     },
//     async (accessToken, refreshToken, profile, done): Promise<void> => {
//       try {
//         // done(null, profile);
//         console.log('profile=', profile);
//         const data = {
//           fullName: profile.displayName,
//           email: profile.emails?.[0]?.value,
//           password: 'googlelogin',
//         };
//         // console.log('google login info', data);
//         const result = await authServices.googleLoginService(data);
//         // console.log('result google login-->', result);
//         if (result.user.email) {
//           done(null, result.user);
//         }
//       } catch (error) {
//         console.log('google login error', error);
//         done(error, undefined);
//       }
//     },
//   ),
// );



// apple login

passport.use(
  new AppleStrategy(
    {
      clientID: config.appleLogin_info.apple_client_id,
      teamID: config.appleLogin_info.apple_team_id,
      keyID: config.appleLogin_info.apple_key_id,
      callbackURL: config.appleLogin_info.apple_callback_url,
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      idToken: string,
      profile: any,
      done: any,
    ) => {
      try {

        console.log('profile=', profile);
        console.log('email=', profile.email);
        console.log('profile.id=', profile.id);


        return done(null, {
          appleId: profile.id,
          email: profile.email || null,
        });
      } catch (err) {
        return done(err);
      }
    },
  ),
);



// // Facebook OAuth Strategy
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: config.social.facebook_client_id as string,
//       clientSecret: config.social.facebook_client_secret as string,
//       callbackURL: 'http://localhost:8025/api/v1/auth/facebook/callback',
//       profileFields: ['id', 'displayName', 'emails'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         console.log('facebook login profile', profile);
//         console.log('profile=', profile);
//         const data = {
//           fullName: profile.displayName,
//           email: profile.emails?.[0]?.value,
//           password: 'facebooklogin',
//           appId: profile.id
//         };
//         console.log('facebook login info', data);
//         const result = await authServices.facebookLoginService(data);
//         // console.log('result google login-->', result);
//         if (result.user.email) {
//           done(null, result.user);
//         }

//       } catch (error) {
//         console.log('facebook login error:',error);
//         // throw new AppError(500, 'Internal Server Error');
//         done(error, null);
//       }
//     },
//   ),
// );

// Serialize & Deserialize User
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done: any) => {
  try {
    // const user = await User.findById(id);
    done(null, id as any);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
