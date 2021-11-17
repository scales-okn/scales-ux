import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { sequelize } from "../database/index";

interface User {
  role: string;
}

export const jwtLogin = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwt_payload, done) => {
    try {
      const { id } = jwt_payload;
      const result = await sequelize.models.User.findOne({
        where: { id },
      });
      if (result) {
        const user: User = result.dataValues;
        return done(null, user);
      }

      return done(null, false);
    } catch (error) {
      console.log(error);
    }
  }
);
