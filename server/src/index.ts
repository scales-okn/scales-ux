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
import feedbackRouter from "./routes/feedback";

const app = express();

(async () => {
  try {
    await database();
    console.log("Database connected successfully!");
    app.emit("ready");
  } catch (error) {
    console.log("Error connecting to database: ", error);
  }
})();

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
  max: 1000, // limit each IP to 100 requests per windowMs
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

// Feedback Router
app.use("/api/feedback", feedbackRouter);

// Panels Router
app.use("/api/panels", panelsRouter);

// Serve React App
app.use(express.static(path.join(__dirname, "../build")));

// Catch all other routes to React App
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.on("ready", () => {
  // Create the Server
  app.listen(process.env.UX_SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.UX_SERVER_PORT}!`);
  });
});

export default app;
