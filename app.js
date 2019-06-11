const express = require('express')
const app = express()
const mongoose = require('mongoose')
const db = require('./config/keys').mongoUri
const users = require('./routes/api/users')
const posts = require('./routes/api/posts')
const profile = require('./routes/api/profile')
const bodyParser = require('body-parser')
const passport  = require('passport')

//@mongo db connection logic
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => console.log("mongo db connected"))
    .catch(err => console.log("!!!!error while connecting to mongo db ", err))


//@default route
app.get('/', (req, res) => {
    res.send('hello')
})


//@passport authentication middleware
app.use(passport.initialize())
require('./config/passport')(passport)



//@body parser middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//@api routes
app.use('/api/users', users)
app.use('/api/posts', posts)
app.use('/api/profile', profile)


//@port setting
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`server started on port ${port}`)
})
