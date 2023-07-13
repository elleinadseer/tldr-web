const router = require('express').Router();

// Import the model
const Post = require('../../models/Post');

// const { Post } = require('../models');

const postData = [
  {
   // post_id: auto increment
    // user_id: connect to user
      post_title: 'my first post',
      post_content: 'hello!'
      // created_at: current_timestamp
      // likes:
      // tag_id: .INTEGER,
  },
  {
    post_title: 'my second post',
    post_content: 'hiya!'
  },
];

const seedPosts = () => Post.bulkCreate(postData);

module.exports = seedPosts;