const yup = require("yup");

export const createHelpTextValidationSchema = yup.object({
  description: yup.string().required(),
  slug: yup.string().required(),
  examples: yup.string(),
  options: yup.string(),
  links: yup.string(),
});
