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

const app = express();

const bootstrap = async () => {
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
    const proxyRouter = await import("./proxy");
    app.use("/proxy", proxyRouter.default);

    // Users Router
    const usersRouter = await import("./routes/users");
    app.use("/api/users", usersRouter.default);

    // Panels Router
    const panelsRouter = await import("./routes/panels");
    app.use("/api/panels", panelsRouter.default);

    // Notebooks Router
    const ringsRouter = await import("./routes/notebooks");
    app.use("/api/notebooks", ringsRouter.default);

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
};

bootstrap();
