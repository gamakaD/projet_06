const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, 'PIQUANTE_SECRET_HOT_TOKEN')
        const userId = decodedToken.userId
        req.auth = { userId }
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user Id'
        } else {
            next()
        }
    } catch {
        res.status(403).json({ error: new Error('Unauthorized request !')})
    }
}