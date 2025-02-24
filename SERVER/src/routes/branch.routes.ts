import { Router } from 'express'
import { addBranchController, getAllBranchController } from '~/controllers/branch.controllers'
import { addBranchValidator } from '~/middlewares/branch.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const branchRouters = Router()

branchRouters.post('/add', accessTokenValidator, addBranchValidator, wrapRequestHandler(addBranchController))

branchRouters.get('/all', accessTokenValidator, wrapRequestHandler(getAllBranchController))

export default branchRouters
