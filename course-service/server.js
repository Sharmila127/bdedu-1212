const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const amqp = require('amqplib');
require('dotenv').config();

const courseRoutes = require('./src/routes/course');

const app = express();
app.use(bodyParser.json());

// MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Course MongoDB connected'))
  .catch(err => console.error(err));

// Redis
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect()
  .then(() => console.log('Redis connected'))
  .catch(err => console.error('Redis error:', err));

// RabbitMQ with retry
let channel;
async function connectRabbit() {
  let connected = false;
  let retries = 0;
  while (!connected && retries < 10) {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await conn.createChannel();
      console.log('RabbitMQ connected');
      connected = true;
    } catch (err) {
      retries++;
      console.log(`RabbitMQ connection failed, retrying in 5s... (${retries}/10)`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  if (!connected) {
    console.error('Could not connect to RabbitMQ, exiting.');
    process.exit(1);
  }
}
connectRabbit();

// Routes
app.use('/course', courseRoutes);

const PORT = process.env.COURSE_PORT || 4100;
app.listen(PORT, () => console.log(`Course service running on port ${PORT}`));


app.get('/course', (req, res) => {
  res.send('Course service is running!');
});
