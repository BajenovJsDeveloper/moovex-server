const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = Router();
const config = require('../config')

// api/auth/register
router.post(
  '/register', [
    check('email').isEmail(),
    check('password').isLength({ min: 4 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).send({ erors: errors.array(), message: 'not valid data' })
    }

  try {
    console.log('Data: ', req.body)
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if(foundUser) {
      return res.status(400).send({ user: foundUser.email, message: 'user already created'});
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashPassword, posts: [] });
    const token = jwt.sign(
      { userId: user.id, email }, 
      config.jwtKey,
      { expiresIn: '1d'}
    );
    user.token = token
    await user.save();
    
    return res.status(201).json({ userid: user.id, token });
  } catch (e) {
    return res.status(500).json({ message: e.message});
  }
})

// api/auth/login
router.post(
  '/login', [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 4 })
  ],
  async (req, res) => {

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send({ message: 'user not authorized'});
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send({ message: 'user not authorized'});

    const token = jwt.sign(
      { userId: user.id, email }, 
      config.jwtKey,
      { expiresIn: '1d'}
    );
    user.token = token;
    await user.save()
    
    return res.json({ token });
  } catch (e) {
    res.status(500).json({ message: e.message});
  }
})

module.exports = router