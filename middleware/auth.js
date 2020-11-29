const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    const token = req.query.token;
    try {
        const data = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findByToken(data.id, token);
        if (!user)
            throw new Error('invalid token');

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.message === 'invalid token') {
            res.status(401).send({message: 'Given wrong token.'});
        } else {
            res.status(500).send({message: 'The server encountered an internal error.'})
        }
    }
};