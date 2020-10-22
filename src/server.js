const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const registerValidation = require('./validation/register')
app.use(bodyParser.json())
const router = express.Router()
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const User = require('./user')
const jwt = require('jsonwebtoken');

require('dotenv').config();
mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@test-db/' + process.env.DB_DATABASE, { useNewUrlParser: true, useUnifiedTopology: true },
    (e) => {
        if (e == null)
            return console.log('Connected to db')
        console.error(e)
    })


app.get('/', (req, res) => {
    res.send('hello world').status(200)
})

app.post('/register', registerValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() })
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const user = new User({
        email: req.body.email,
        password: hashedPassword,
    })
    user.save()
        .then(() => {
            res.send('User successfully created.').status(200)
        })
        .catch((e) => {
            res.send(e).status(400)
        })
})

app.post('/login', (req, res) => {
    const user = User.findOne({email: req.body.email})
    if (user === undefined) {
        return res.send('email not found').status(404)
    }
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (validPass === undefined) {
        return res.send('wrong password').status(403)
    }
    const token = jwt.sign({_id: user._id, role: user.role}, process.env.JWT_SECRET);
    res.header('auth-token', token).send(token);
})

app.listen(8080)