import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

export const jwtLogin = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  (token, done) => {
    return done(null, token);
  }
);
