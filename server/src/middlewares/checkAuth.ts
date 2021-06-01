import passport from "passport";
import { NextFunction, Request, Response } from "express";

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!user) {
        return res.send_unauthorized("Unauthorized");
      } else {
        req.user = user;
        next();
      }
    })(req, res, next);
  } catch (err) {
    console.log(err);
  }
};

export default checkAuth;
