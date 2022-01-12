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
    // app.use(limiter);

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

    // Temp
    app.get("/api/satyrn/rings/:ringId", (req, res) => {
      const info = {
        totalCount: 267678,
        page: 0,
        batchSize: 10,
        activeCacheRange: [0, 100],
        results: [
          {
            id: "1-16-cv-07202-LDH|||1:16-cv-07202-LDH",
            caseName: "Yao et al v. Lynch et al",
            natureOfSuit: "Other Immigration Actions",
            dateFiled: "2016-12-31",
            circuit: "2d Cir.",
            district: "E.D.N.Y.",
            judgeName: "LaShann DeArcy Hall",
          },
          {
            id: "1-16-cv-02545-RDM|||1:16-cv-02545-RDM",
            caseName:
              "Ringelberg v. Vanguard Integrity Professionals -Nevada, Inc. et al",
            natureOfSuit: "Employment",
            dateFiled: "2016-12-31",
            circuit: "D.C. Cir.",
            district: "D.D.C.",
            judgeName: "Randolph D. Moss",
          },
          {
            id: "1-16-cv-07201-NGG-SMG|||1:16-cv-07201-NGG-SMG",
            caseName: "Campbell v. Munoz et al",
            natureOfSuit: "Other Civil Rights",
            dateFiled: "2016-12-31",
            circuit: "2d Cir.",
            district: "E.D.N.Y.",
            judgeName: "Steven M. Gold",
          },
          {
            id: "2-16-cv-09667-AB-AFM|||2:16-cv-09667-AB-AFM",
            caseName: "Sos Co Inc et al v. E-Collar Technologies, Inc., et al",
            natureOfSuit: "Patent",
            dateFiled: "2016-12-31",
            circuit: "9th Cir.",
            district: "C.D. Cal.",
            judgeName: "Beverly Reid O'Connell",
          },
          {
            id: "1-16-cv-04816-TCB|||1:16-cv-04816-TCB",
            caseName: "Giles v. Rgl Associates, Inc.",
            natureOfSuit: "Consumer Credit",
            dateFiled: "2016-12-31",
            circuit: "11th Cir.",
            district: "N.D. Ga.",
            judgeName: "Alan J. Baverman",
          },
          {
            id: "1-16-cv-03111|||1:16-cv-03111",
            caseName: "Filing Error",
            natureOfSuit: "Trademark",
            dateFiled: "2016-12-31",
            circuit: "6th Cir.",
            district: "N.D. Ohio",
            judgeName: null,
          },
          {
            id: "1-16-cv-11764|||1:16-cv-11764",
            caseName: "Smuk et al v. Selene Finance, Lp et al",
            natureOfSuit: "Consumer Credit",
            dateFiled: "2016-12-31",
            circuit: "7th Cir.",
            district: "N.D. Ill.",
            judgeName: "Thomas M. Durkin",
          },
          {
            id: "3-16-cv-09616-BRM-DEA|||3:16-cv-09616-BRM-DEA",
            caseName: "Gooding v. Central Regional School District et al",
            natureOfSuit: "Other Civil Rights",
            dateFiled: "2016-12-31",
            circuit: "3d Cir.",
            district: "D.N.J.",
            judgeName: "Brian R. Martinotti",
          },
          {
            id: "0-16-cv-63050-WPD|||0:16-cv-63050-WPD",
            caseName: "Amireh v. Symmetry Management Corp.",
            natureOfSuit: "Other Statutory Actions",
            dateFiled: "2016-12-31",
            circuit: "11th Cir.",
            district: "S.D. Fla.",
            judgeName: "William P. Dimitrouleas",
          },
          {
            id: "1-16-cv-03541-RLY-TAB|||16-cv-03541-RLY-TAB",
            caseName: "Dishon v. Cook Incorporated, et Al.",
            natureOfSuit: "Personal Injury- Product Liability",
            dateFiled: "2016-12-31",
            circuit: "7th Cir.",
            district: "S.D. Ind.",
            judgeName: "Richard L. Young",
          },
        ],
      };

      if (req.params.ringId === "1") {
        res.json(info);
      } else {
        setTimeout(() => {
          res.send(info);
        }, 6000);
      }
    });

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
