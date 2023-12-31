const router = require('express').Router();
const { where } = require('sequelize');
const { Post, Comment, User, Tag } = require('../models');
const withAuth = require('../utils/auth');

const tags = ['comedy', 'general', 'help', 'discussion'];

router.get('/', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['user_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        },
        {
          model: Comment,
          attributes: [
            'comment_id',
            'user_id',
            'post_id',
            'comment_text',
            'created_at',
            'likes',
          ],
          include: [User],
          separate: true,
          order: [['created_at', 'DESC']],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const posts = postData.map((post) => post.get({ plain: true }));

    const trendingData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['user_name'],
        },
      ],
      order: [['likes', 'DESC']],
      limit: 4,
    });

    const trendingPosts = trendingData.map((post) => post.get({ plain: true }));

    // Only include the user session in the rendering of the homepage if the user is logged in
    if (req.session.logged_in) {
      const user = await User.findByPk(req.session.user_id);
      //const user = await User.findByPk(1);
      const loggedOnUser = user.get({ plain: true });

      res.render('homepage', {
        posts,
        trendingPosts,
        logged_in: req.session.logged_in,
        loggedOnUser,
        tags,
      });
    } else {
      res.render('homepage', {
        posts,
        trendingPosts,
        logged_in: req.session.logged_in,
        tags,
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['user_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        },
        {
          model: Comment,
          attributes: [
            'comment_id',
            'user_id',
            'post_id',
            'comment_text',
            'created_at',
            'likes',
          ],
          include: [User],
          separate: true,
          order: [['created_at', 'DESC']],
        },
      ],
      where: {
        user_id: req.params.id,
      },
    });

    const posts = postData.map((post) => post.get({ plain: true }));

    const trendingData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['user_name'],
        },
      ],
      order: [['likes', 'DESC']],
      limit: 4,
    });

    const trendingPosts = trendingData.map((post) => post.get({ plain: true }));

    //const user = await User.findByPk(req.session.user_id);
    const user = await User.findByPk(req.params.id);
    const loggedOnUser = user.get({ plain: true });

    res.render('homepage', {
      posts,
      trendingPosts,
      logged_in: req.session.logged_in,
      loggedOnUser,
      tags,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/tag/:tag_name', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['user_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        },
        {
          model: Comment,
          attributes: [
            'comment_id',
            'user_id',
            'post_id',
            'comment_text',
            'created_at',
            'likes',
          ],
          include: [User],
          separate: true,
          order: [['created_at', 'DESC']],
        },
      ],
      order: [['created_at', 'DESC']],
      where: {}, // Empty object for the condition
    });

    const posts = postData.map((post) => post.get({ plain: true }));

    const trendingData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['user_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
          where: { tag_name: req.params.tag_name }, // Filter by the selected tag
        },
      ],
      order: [['likes', 'DESC']],
      limit: 4,
    });

    const trendingPosts = trendingData.map((post) => post.get({ plain: true }));

    // Filter posts based on the selected tag
    const filteredPosts = posts.filter((post) =>
      post.tags.some((tag) => tag.tag_name === req.params.tag_name)
    );

    if (req.session.logged_in) {
      const user = await User.findByPk(req.session.user_id);
      const loggedOnUser = user.get({ plain: true });

      res.render('homepage', {
        posts: filteredPosts,
        logged_in: req.session.logged_in,
        loggedOnUser,
        tags,
        trendingPosts,
      });
    } else {
      res.render('homepage', {
        posts: filteredPosts,
        logged_in: req.session.logged_in,
        tags,
        trendingPosts,
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/post/:post_id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.post_id, {
      include: [
        {
          model: User,
          attributes: ['user_name'],
        },
        {
          model: Comment,
          attributes: ['comment_text', 'created_at', 'likes'],
        },
      ],
    });

    const post = postData.get({ plain: true });

    /*     res.status(200).json({
      ...post,
      logged_in: req.session.logged_in,
    }); */

    res.render('thread', {
      ...post,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/profile', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['user_password'] },
      include: [{ model: Post }, { model: Comment }],
    });

    const user = userData.get({ plain: true });

    res.render('profile', {
      ...user,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/user/:user_id', async (req, res) => {
  try {
    const userData = await User.findByPk(req.params.user_id, {
      attributes: { exclude: ['user_password'] },
      include: [{ model: Post }, { model: Comment }],
    });

    const user = userData.get({ plain: true });

    // Maybe swap this out for a seperate 'user' view?
    res.render('profile', {
      ...user,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/signup', (req, res) => {
  // If the user is already logged in, redirect the request to their profile route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('signup');
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to their profile route
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('login');
});

module.exports = router;
