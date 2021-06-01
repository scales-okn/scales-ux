import { Request, Response, NextFunction } from "express";

const validateResource =
  // @ts-ignore

    (resourceValidationSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
      const resource = req.body;

      try {
        // Throws an error if not valid
        await resourceValidationSchema.validate(resource, {
          abortEarly: false,
        });
        next();
      } catch (error) {
        // @ts-ignore
        const errors = error.inner.reduce((accumulator, { path, message }) => {
          if (path) {
            accumulator[path] = message;
          }
          return accumulator;
        }, {});
        console.log(error);
        return res.send_badRequest("", errors);
      }
    };

export default validateResource;
