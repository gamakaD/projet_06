const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            user.save()
                .then(() => res.status(201).json({ message: 'User created successfuly !'}))
                .catch(error => res.status(400).json({ message: error }))
        })
        .catch(error => res.status(500).json({ message: error }))
}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'User not find !'})
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Password not match !'})
                    }
                    res.status(201).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'PIQUANTE_SECRET_HOT_TOKEN',
                            { expiresIn: '24h'}
                        )
                    })
                })
                .catch(error => res.status(500).json({ message: error }))
        })
        .catch(error => res.status(500).json({ message: error }))
}