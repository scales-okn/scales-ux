import * as yup from "yup";
import { ringVisibilityValues } from "../models/Ring";

export const createRingValidationSchema = yup.object({
  name: yup.string().required(),
  userId: yup.string().required(),
  notebookId: yup.string().required(),
  contents: yup.string(),
  sourceType: yup.string().required(),
  connectionDetails: yup.string(),
  description: yup.string(),
  visibility: yup.mixed().oneOf(ringVisibilityValues)
});
