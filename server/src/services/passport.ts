import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import database from "../database";

export const jwtLogin = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwt_payload, done) => {
    try {
      const results = await database.models.User.findAll({
        where: { id: jwt_payload.id },
      });
      if (results.length) {
        // const { id, role, blocked, approved } = results[0].dataValues;
        const user = results[0].dataValues;
        console.log(user);
        return done(null, user);
      }

      return done(null, false);
    } catch (err) {
      console.log(err);
    }
  }
);
