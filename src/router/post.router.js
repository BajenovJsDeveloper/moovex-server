const { Router } = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = Router();
// Json Webtoken Auth
const jwtAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const { email, userId } = jwt.verify(token, config.jwtKey);
    req.user = { email, userId }
    next()
  } catch (e) {
    res.status(401).send({ message: 'not authorized user'})
  }
}

// api/post/posts  get all posts
router.get('/posts', jwtAuth, async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({email});
    console.log('User: ', req.user)
    res.send({ posts: user.posts })
  } catch (e) {
    res.status(500).send({message: e.message});
  }
})

// api/post/posts/:id  delete posts ID
router.delete('/posts/:id', jwtAuth, async (req, res) => {
  try {
    const { id } = req.params; 
    const { email } = req.user;
    const user = await User.findOne({ email });
    const { posts } = user;
    if(posts.includes(Number(id))) {
      const filtredPosts = posts.filter(p => p.toString() !== id)
      user.posts = filtredPosts;
      await user.save();
      res.status(200).send({message: 'post deleted', id })
    } else throw new Error('No post with this id');
  } catch (e) {
    res.status(500).send({message: e.message});
  }
})

// api/post/posts/add  add post atrray
router.post(
  '/posts/add',[
    body('posts').isArray()
  ], 
  jwtAuth, async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).send({ erors: errors.array(), message: 'not valid data' })
    }
  try {
    const { posts } = req.body;
    const { email } = req.user;
    const user = await User.findOne({ email });
    user.posts = [ ...user.posts, ...posts]
    await user.save();
    res.send({posts: user.posts})
  } catch (e) {
    res.status(500).send({message: e.message});
  }
})

module.exports = router;