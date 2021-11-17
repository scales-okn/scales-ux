import {
  create,
  deletePanel,
  findAll,
  findById,
  update,
} from "../controllers/panels";

import checkAuth from "../middlewares/checkAuth";
import express from "express";

const router = express.Router();

router.post("/", checkAuth, create);

router.get("/", checkAuth, findAll);

router.get("/:panelId", checkAuth, findById);

router.put("/:panelId", checkAuth, update);

router.delete("/:panelId", checkAuth, deletePanel);

export default router;
