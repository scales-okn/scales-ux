import * as yup from "yup";
import { ringVisibilityValues } from "../models/Ring";

export const createRingValidationSchema = yup.object({
  userId: yup.string().required(),
  rid: yup.string(),
  name: yup.string().required(),
  description: yup.string().required(),
  schemaVersion: yup.number().required(),
  dataSource: yup.object().required(),
  ontology: yup.object().required(),
  visibility: yup.mixed().oneOf(ringVisibilityValues),
});
