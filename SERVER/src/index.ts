import express from 'express'
import userRouters from '~/routes/users.routes'
import databaseService from '../services/database.services'
import { defaultErrorHandler } from './middlewares/errorsMiddlewares'
import mediaRouters from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import cors from 'cors'
import branchRouters from './routes/branch.routes'
import ServicesRouters from './routes/services.routes'
import databaseServiceSale from '../services/database.services.sale'
import productRouters from './routes/product.routes'
import servicesOfCardRouters from './routes/services.card.routes'
import CustomersRouter from './routes/customers.routes'
import CommisionRouter from './routes/commision.routes'
config()

const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization'
}

databaseService.connect()
databaseServiceSale.connect()
const app = express()
const port = process.env.PORT || 8081
initFolder()
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/users', userRouters)
app.use('/upload', mediaRouters)
app.use('/branch', branchRouters)
app.use('/services', ServicesRouters)
app.use('/products', productRouters)
app.use('/services-card', servicesOfCardRouters)
app.use('/customers', CustomersRouter)
app.use('/commision', CommisionRouter)
app.use(defaultErrorHandler)

console.log(new Date('2025-04-21T17:00:00.000Z'))
app.listen(port, () => {
  console.log(`Server is running on http://localhost: ${port}`)
})
