import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { customerMessages } from '~/constants/messages'
import { ResponseSuccess } from '~/utils/handlers'
import { CreateCustomerRequestBody } from '~/models/requestes/Customer.request'
import customerServices from 'services/customer.services'

export const createCustomerControllers = async (
  req: Request<ParamsDictionary, any, CreateCustomerRequestBody>,
  res: Response
) => {
  const data = req.body
  await customerServices.createCustomer(data)
  return ResponseSuccess({
    res,
    message: customerMessages.CREATE_CUSTOMER_SUCCESS
  })
}
