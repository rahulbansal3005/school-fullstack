const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs.js')
const mongoose = require('mongoose')

require('dotenv').config()
const mongoUrl = process.env.MONGODB_URI

mongoose.connect(mongoUrl)
mongoose.Promise = global.Promise

app.use(cors())
app.use(bodyParser.json())

app.use('/api/blogs', blogsRouter)

const PORT = 3003
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})