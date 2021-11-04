import express, { Request, Response } from "express";
import path from "path";
import responser from "responser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { jwtLogin } from "./services/passport";
import database from "./database";
import proxyRouter from "./proxy";
import usersRouter from "./routes/users";
import ringsRouter from "./routes/rings";
import panelsRouter from "./routes/panels";
import notebooksRouter from "./routes/notebooks";

const app = express();

(async () => {
  try {
    // Database
    await database();

    // Middlewares
    app.use(express.json());
    app.use(
      express.urlencoded({
        extended: true,
      })
    );
    app.use(responser);
    app.use(cors());
    app.use(helmet());
    app.use(hpp());

    // see https://expressjs.com/en/guide/behind-proxies.html
    // app.set('trust proxy', 1);
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });

    // Apply limiter to all requests
    app.use(limiter);

    // Passport
    app.use(passport.initialize());
    passport.use(jwtLogin);

    // Proxy Router
    app.use("/proxy", proxyRouter);

    // Users Router
    app.use("/api/users", usersRouter);

    // Rings Router
    app.use("/api/rings", ringsRouter);

    // Notebooks Router
    app.use("/api/notebooks", notebooksRouter);

    // Panels Router
    app.use("/api/panels", panelsRouter);

    // Serve React App
    app.use(express.static(path.join(__dirname, "../client/build")));

    // Catch all other routes to React App
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../client/build", "index.html"));
    });

    // Create the Server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on ${process.env.PORT} port!`);
    });
  } catch (error) {
    console.log(error);
  }
})();
