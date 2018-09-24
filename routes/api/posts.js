const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

//Post model
const Post = require('../../models/Post');

//Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

//@route  GET api/posts/test
//@desc   Tests post route
//@access Public
router.get('/test', (req, res) => {
  res.json({
    msg: "posts work"
  });
});

//@route  GET api/posts
//@desc   Get posts
//@access Public
router.get('/', (req, res) => {

  Post.find()
    .sort({
      date: -1
    })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({
      noposts: 'No posts found'
    }));
});

//@route  GET api/posts/:id
//@desc   Get post post by id
//@access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({
      nopostfound: 'No post found with that ID'
    }));
});


//@route  Post api/posts
//@desc   Create post
//@access Private
router.post('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  const {
    errors,
    isValid
  } = validatePostInput(req.body);

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

//@route  DELETE api/posts/:id
//@desc   Delete post
//@access Private
router.delete('/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Post.findOne({
      user: req.user.id
    })
    .then(post => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
              notauthorized: 'User not authorized'
            });
          }

          //delete 
          post.remove().then(() => res.json({
            success: true
          }));
        })
        .chatch(err => res.status(404).json({
          postnotfound: 'Post not found'
        }));
    });

});

//@route  Post api/posts/like/:id
//@desc   Like post
//@access Private
router.post('/like/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {

          if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
              alreadyliked: "User already liked this post"
            });
          }

          //add user likes array
          post.likes.unshift({
            user: req.user.id
          });

          post.save().then(post => res.json(post));

        }).catch(err => res.status(404).json({
          postnotfound: "No post found"
        }))

    });
});

//@route  Post api/posts/unlike/:id
//@desc   unlike post
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {

          if (
            post.likes.filter(like => like.user.toString() === req.user.id).length === 0
          ) {
            return res.status(400).json({
              notliked: "you have not liked this post"
            });
          }

          //Get remove index
          const removeIindex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //Splice out of array
          post.likes.splice(removeIindex, 1);

          //save
          post.save().then(post => res.json(post));

        }).catch(err => res.status(404).json({
          postnotfound: "No post found"
        }));

    });
});

//@route  Post api/posts/comment/:id
//@desc   post a comment
//@access Private
router.post('/comment/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validatePostInput(req.body);

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };

      // Add to comments array
      post.comments.unshift(newComment);

      //save
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({
      postnotfound: "post not found"
    }));
});

//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   delete a comment
//@access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  Post.findById(req.params.id)
    .then(post => {

      //check to see if comment ndoes exist
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res.status(404).json({
          commentnotexists: 'comment does not exist'
        });

      }

      //Get remove index
      const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

      //Splice comment out of array
      post.comments.splice(removeIndex, 1);

      //Save
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({
      postnotfound: "post not found"
    }));
});



module.exports = router;