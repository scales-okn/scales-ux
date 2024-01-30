import passport from "passport";
import { NextFunction, Request, Response } from "express";
import { jwtLogin } from "../services/passport";
import { sequelize } from "../database";

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers["x-api-key"] === process.env.CORE_API_KEY) {
      return next();
    }
    passport.authenticate(jwtLogin, { session: false }, async (error, token) => {
      if (error || !token) {
        console.log({ error, token });
        return res.send_unauthorized("Unauthorized");
      }
      const user = await sequelize.models.User.findOne({
        where: { id: token.user.id },
      });
      if (!user) {
        return res.send_unauthorized("Unauthorized");
      }
      req.user = user?.dataValues;
      next();
    })(req, res, next);
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console
    return res.send_internalServerError("An error occurred, please try again!");
  }
};

export default checkAuth;
