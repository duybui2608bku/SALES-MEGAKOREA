import { NextFunction, Request, Response } from 'express'
import { HttpStatusCode, UserRole } from '../constants/enum'
import { ErrorWithStatusCode } from '../models/Errors'
import { TokenPayload } from '../models/requestes/User.requests'

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.decode_authorization as TokenPayload

    if (!roles.includes(role as UserRole)) {
      return next(
        new ErrorWithStatusCode({
          message: 'You are not authorized to access this resource',
          statusCode: HttpStatusCode.Forbidden
        })
      )
    }
    next()
  }
}
