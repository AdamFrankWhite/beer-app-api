const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')

require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())

app.use(express.json())

const dbURI = process.env.ATLAS_URI

mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('useCreateIndex', true);
const connection = mongoose.connection
connection.once('open',  () => {
    console.log("Connected to MongoDB")
})

const usersRouter = require('./routes/users.js')
app.use('/users', usersRouter)




app.listen(port, () => {
    console.log(`Server is up and running: port ${port}`)
})

