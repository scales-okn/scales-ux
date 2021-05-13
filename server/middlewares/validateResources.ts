import { Request, Response, NextFunction } from "express";

const validateResource =
  // @ts-ignore
  (resourceValidationSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const resource = req.body;

      try {
        // Throws an error if not valid
        await resourceValidationSchema.validate(resource, { abortEarly: false });
        next();
      } catch (err) {
        console.log(err)
        // TODO: Errors Keys
        return res.send_badRequest("", err.errors);
      }
    };

export default validateResource;
