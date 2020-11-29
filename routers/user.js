const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const {id, pw, name} = req.body;
        if (id === undefined || pw === undefined || name === undefined) {
            res.status(400).send({code: 40001, message: 'Given insufficient parameters.'});
        } else if (typeof id !== 'string' || typeof pw !== 'string' || typeof name !== 'string') {
            res.status(400).send({code: 40002, message: 'Given wrong parameters (type).'});
        } else if (id.length >= 20 || id.length <= 5 || pw.length >= 20 || pw.length <= 5 || name.length >= 20 || name.length <= 1) {
            res.status(400).send({code: 40003, message: 'Given wrong parameters (length).'});
        } else if (await User.getRowById(id) !== null) {
            res.status(409).send({message: 'The specified account already exists.'});
        } else {
            const user = await User.create(id, pw, name);
            res.status(201).send({message: "The account has been created successfully.", user: user});
        }
    } catch (error) {
        res.status(500).send({message: 'The server encountered an internal error.'})
    }
});

router.post('/login', async (req, res) => {
    try {
        const {id, pw} = req.body;
        if (id === undefined || pw === undefined) {
            res.status(400).send({code: 40001, message: 'Given insufficient parameters.'});
        } else if (typeof id !== 'string' || typeof pw !== 'string') {
            res.status(400).send({code: 40002, message: 'Given wrong parameters (type).'});
        } else if (id.length >= 20 || id.length <= 5 || pw.length >= 20 || pw.length <= 5) {
            res.status(400).send({code: 40003, message: 'Given wrong parameters (length).'});
        } else if (await User.getRowById(id) === null) {
            res.status(401).send({message: 'The account login was failed.'});
        } else {
            const user = await User.findByPassword(id, pw);
            if (user === null) {
                res.status(401).send({message: 'The account login was failed.'});
            } else {
                res.status(200).send({message: "The account login was successful.", user: user});
            }
        }
    } catch (error) {
        res.status(500).send({message: 'The server encountered an internal error.'})
    }
});

router.post('/me', auth, async (req, res) => {
    req.params
    res.status(200).send({message: "The account check was successful.", user: req.user});
})

router.post('/logout', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.resetToken();
        await req.user.save();
        res.status(205).send({message: "The account token has been successfully initialized.", user: req.user});
    } catch (error) {
        res.status(500).send({message: 'The server encountered an internal error.'})
    }
})
module.exports = router;