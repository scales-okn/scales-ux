import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import User from "../models/user";

export const jwtLogin = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwt_payload, done) => {
    try {
      const user = await User.findAll({ where: { id: jwt_payload.id } });
      if (user.length) {
        return done(null, user);
      }

      return done(null, false);
    } catch (err) {
      console.log(err);
    }
  }
);
