import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import passport from "passport";
import path from "path";
import responser from "responser";
import database from "./database";
import { queryResolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/schema";
import proxyRouter from "./proxy";
import alertsRouter from "./routes/alerts";
import connectionsRouter from "./routes/connections";
import feedbackRouter from "./routes/feedback";
import helpTextsRouter from "./routes/helpTexts";
import notebooksRouter from "./routes/notebooks";
import panelsRouter from "./routes/panels";
import ringsRouter from "./routes/rings";
import teamsRouter from "./routes/teams";
import usersRouter from "./routes/users";
import graphRouter from "./routes/graph";
import { jwtLogin } from "./services/passport";

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

// Connections Router
app.use("/api/connections", connectionsRouter);

// Help Texts Router
app.use("/api/helpTexts", helpTextsRouter);

// Panels Router
app.use("/api/panels", panelsRouter);

// Alerts Router
app.use("/api/alerts", alertsRouter);

// Teams Router
app.use("/api/teams", teamsRouter);

app.use("/api/graph", graphRouter);

// Serve React App
app.use(express.static(path.join(__dirname, "../build")));

// Catch all other routes to React App
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

const server = new ApolloServer({
  typeDefs,
  resolvers: queryResolvers,
});

app.on("ready", async () => {
  // Create the Server
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`🚀  Server ready at: ${url}`);
  app.listen(process.env.UX_SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.UX_SERVER_PORT}!`);
  });
});

export default app;
