const express = require('express')
const router = express.Router()
const User = require('./../../model/User')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('./../../config/keys')
const passport = require('passport')


//@load input validation
const validateRegisterInput = require('../../validation/register')
const validateLogin = require('../../validation/login')

//@type = GET
//@route = /api/users/test
//@desc = test route/public
router.get('/test', (req, res) => {
    res.json({msg: "users route worked!!!!"})
})


//@type = POST
//@route = /api/users/register
//@desc = register route /public
router.post('/register', (req, res) => {

    const {errors, isValid} = validateRegisterInput(req.body)

    //@check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }


    User.findOne({email: req.body.email})
        .then((user) => {
            if (user) {
                errors.email = "Email already exist"
                return res.status(400).json(errors)
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                })


                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                        }

                        newUser.password = hash
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
})
//@type = POST
//@route = /api/users/login
//@desc = login route / public
router.post('/login', (req, res) => {

    //@errors
    const {errors, isValid} = validateLogin(req.body)
    if (!isValid) {
        res.status(400).json(errors)
    }


    const email = req.body.email
    const password = req.body.password

    User.findOne({email})
        .then(user => {
            if (!user) {
                errors.email = "User not found"
                return res.json(errors)

            } else {
                //check password
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = {id: user.id, name: user.name, avatar: user.avatar}
                            jwt.sign(payload, keys.secret, {expiresIn: 30}, (err, token) => {
                                if (err)
                                    return res.status(400).json({error: "wrong credentials"})
                                else
                                    res.json({
                                            msg: "user logged in successfully",
                                            token: `Bearer ${token}`
                                        }
                                    )
                            })


                        } else {
                            errors.password = "Password is incorrect"
                            return res.status(400).json(errors)
                        }
                    })
            }
        })
})
//@type = POST
//@route = /api/users/dashboard
//@desc = dashboard route / private
router.get('/dashboard', passport.authenticate('jwt', {session: false}, () => {
}), (req, res) => {
    res.send(req.user)
})


module.exports = router