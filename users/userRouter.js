const express = require('express');

const Users = require('./userDb');
const Posts = require('../posts/postDb');

const router = express.Router();

router.post('/', validateUser, (req, res) => {
  const userInfo = req.body;

  Users.insert(userInfo)
    .then(user => {
      res.status(201).json({ user });
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'Error saving user to the database' }, err);
    });
});

router.post('/:id/posts', [validateUserId, validatePost], (req, res) => {
  const postInfo = { ...req.body, user_id: req.params.id };

  Posts.insert(postInfo)
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'Error saving post to the database' }, err);
    });
});

router.get('/', (req, res) => {
  Users.get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error retrieving the users' }, err);
    });
});

router.get('/:id', validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
  const { id } = req.params;
  Users.getUserPosts(id)
    .then(posts => {
      res.status(200).json({ posts });
    })
    .catch(err => {
      res.status(500).json({ message: 'Error retrieving the posts' }, err);
    });
});

router.delete('/:id', validateUserId, (req, res) => {
  const { id } = req.params;

  Users.remove(id).then(count => {
    if (count > 0) {
      res.status(200).json({ message: 'The user has been removed' });
    } else {
      res.status(404).json({ message: 'The user could not be found' });
    }
  });
});

router.put('/:id', [validateUserId, validateUser], (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  Users.update(id, userData)
    .then(user => {
      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(404).json({ message: 'The user could not be found' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Error updating the user' }, err);
    });
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;

  Users.getById(id).then(user => {
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(400).json({ message: 'invalid user id' });
    }
  });
}

function validateUser(req, res, next) {
  const body = req.body;

  if (!body || body === {}) {
    res.status(400).json({ message: 'missing user data' });
  } else if (!body.name) {
    res.status(400).json({ message: 'missing required name field' });
  } else {
    next();
  }
}

function validatePost(req, res, next) {
  const body = req.body;

  if (!body || body === {}) {
    res.status(400).json({ message: 'missing post data' });
  } else if (!body.text) {
    res.status(400).json({ message: 'missing post text' });
  } else {
    next();
  }
}

module.exports = router;
