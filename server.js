const express = require('express')
const connectDB = require("./config/db")
const errorHandler = require('./middleware/errorHandler')
const colors = require('colors')
const minimum = require('./utils/create.minimum')
const createAdmin = require('./utils/createAdmin')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(cors())

const PORT = process.env.PORT || 3000

connectDB()

createAdmin()
minimum()


app.use('/auth', require('./router/auth.router'))
app.use("/rank", require("./router/rank.router"))
app.use('/location', require('./router/location.router'))
app.use('/position', require('./router/position.router'))
app.use('/minimum', require('./router/minimum.router'))
app.use('/worker', require('./router/worker.router'))
app.use('/folder', require('./router/folder.router'))
app.use('/file', require("./router/file.router"))
app.use('/table', require('./router/table.router'))
app.use('/paymentAndDeduct', require('./router/paymentAndDeduct.router'))
app.use("/payment", require('./router/payment.router'))
app.use("/deduct", require('./router/deduct.router'))

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server run on port : ${PORT}`.blue)
})
