import { NextFunction, Request, RequestHandler, Response } from 'express'
import { HttpStatusCode } from '~/constants/enum'

export const wrapRequestHandler = <P>(fn: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export const ResponseSuccess = ({ res, message, result }: { res: Response; message: string; result?: any }) => {
  return res.status(HttpStatusCode.Ok).json({
    success: true,
    message,
    result
  })
}

export const ResponseError = ({
  res,
  message,
  statusCode
}: {
  res: Response
  message: string
  statusCode?: HttpStatusCode
}) => {
  if (!statusCode) {
    statusCode = HttpStatusCode.BadRequest
  }
  return res.status(statusCode).json({
    success: false,
    message
  })
}
