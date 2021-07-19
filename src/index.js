const express = require('express');
const app = express();
const routerLogin = require('./router/auth.router.js');
const routerPost = require('./router/post.router.js');
const cors = require('cors');

const config = require('./config')
const mongoose = require('mongoose');

app.use(express.json());
app.use(cors());
app.use('/api/auth', routerLogin);
app.use('/api/post', routerPost);

async function start() {
  const uri = `mongodb+srv://admin:${config.mongoPass}@cluster0.gvk8v.mongodb.net/moovex?retryWrites=true&w=majority`;
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    app.listen(config.port, () => {
      console.log(`Server running on  http://localhost:${config.port}`);
    })
  } catch (e) {
    console.log('Connection DB Error: ', e.message);
  }
}

start();
process.on('SIGINT', (err) => {
  console.log("Servicess stoped");
  process.exit(1);
});