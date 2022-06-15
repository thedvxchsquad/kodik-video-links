import { Request, Response } from "express";

export const makeError = (code: number, message: string): ResponseError => ({ statusCode: code, error: { status: code, message }});
export const makeResponse = <T = unknown>(code: number, data: T): ResponseOk<T> => ({ statusCode: code, data });
export const Errors = {
  internal: makeError(500, "Internal error"),
  notFound: makeError(404, "Not Found"),
};
export const makeController = (fn: (req: Request, res: Response) => MayBePromise<ResponseError | ResponseOk>) => {
  return async (req: Request, res: Response) => {
    try {
      const result = await Promise.resolve(fn(req,res));
      if(typeof result !== "object" || result == null) return res.error(Errors.internal);
      if("data" in result) return res.ok(result);
      if("error" in result) return res.error(result);
      return res.error(Errors.internal);
    } catch (error) {
      return res.error(Errors.internal);
    };
  };
};  