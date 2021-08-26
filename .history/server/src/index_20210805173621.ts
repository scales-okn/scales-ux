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
import proxyRoutes from "./proxy";

const app = express();
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

// Apply to all requests
// app.use(limiter);

// Proxy Routes
app.use("/proxy", proxyRoutes);

// Run Database
database.run().then(async () => {
  try {
    // Passport
    app.use(passport.initialize());
    passport.use(jwtLogin);

    // User Routes
    const userRoutes = await import("./routes/user");
    app.use("/api/users", userRoutes.default);

    // Notebook Routes
    const notebookRoutes = await import("./routes/notebook");
    app.use("/api/notebooks", notebookRoutes.default);

    // Ring Routes
    const ringRoutes = await import("./routes/ring");
    app.use("/api/rings", ringRoutes.default);

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
});

// TODO: Add Logger
// TODO: Add Standardized Responses ✓
// TODO: Add i18n (gettext)
// TOOD: Add Error handler
