const express = require("express");
const router = express.Router();
const passport = require("passport");
const Post = require("../../Models/Post");
const Profile = require("../../Models/Profile");
const User = require("../../Models/User");
const validatePostInput = require("../../Validation/post");

// @ POST api/posts
// @desc create a post
// @access Private
router.post(
  "/",

  passport.authenticate("jwt", { session: false }),

  async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) return res.status(400).json(errors);

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

// @ POST api/posts/currentuser
// @desc get all posts of current logged user
// @access Private
router.get(
  "/currentuser",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id }).populate("user", [
        "name",
        "avatar"
      ]);

      if (posts.length < 1)
        return res
          .status(404)
          .json({ msg: "No posts were found for specified user" });

      return res.status(200).json(posts);
    } catch (err) {
      console.log(err);
      return res.status(500).send("server error");
    }
  }
);

// @ POST api/posts
// @desc get all posts
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 });

      if (posts.length < 1)
        return res.status(404).json({ msg: "No posts were found" });

      return res.status(200).json(posts);
    } catch (err) {
      console.log(err);
      return res.status(500).send("server error");
    }
  }
);

// @ POST api/posts/:PostID
// @desc get post by ID
// @access Private
router.get(
  "/:PostID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.PostID);

      if (!post) return res.status(404).json({ msg: "No post was found" });

      return res.status(200).json(post);
    } catch (err) {
      if (err.kind === "ObjectId")
        return res.status(404).json({ msg: "No post was found" });
      console.log(err);
      return res.status(500).send("server error");
    }
  }
);

// @ DELETE api/posts/:PostID
// @desc delete a post by id
// @access Private
router.delete(
  "/:PostID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.PostID);

      //Check user

      if (post.user.toString() !== req.user.id)
        return res.status(401).json({ msg: "User not authorized" });

      if (!post) return res.status(404).json({ msg: "No post was found" });

      await post.remove();

      return res.status(200).json({ msg: "Post removed" });
    } catch (err) {
      if (err.kind === "ObjectId")
        return res.status(404).json({ msg: "No post was found" });
      console.log(err);
      return res.status(500).send("server error");
    }
  }
);

// @ PUT api/posts/like/:PostID
// @desc like a post
// @access Private
router.put(
  "/like/:PostID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.PostID);

      //Check if post was already liked by user

      if (
        post.likes.filter(like => like.user.toString() === req.user.id).length >
        0
      )
        return res.status(400).json({ msg: "post already liked" });

      post.likes.unshift({ user: req.user.id });

      await post.save();

      return res.status(200).json(post.likes);
    } catch (err) {
      if (err.kind === "ObjectId")
        return res.status(404).json({ msg: "No post was found" });
      console.log(err);
      return res.status(500).send("server error");
    }
  }
);

// @ DELETE api/posts/like/:PostID
// @desc unlike a post
// @access Private
router.delete(
  "/like/:PostID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.PostID);

      //Check if post was already liked by user

      if (
        post.likes.filter(like => like.user.toString() === req.user.id)
          .length === 0
      )
        return res.status(400).json({ msg: "post has not yet been liked" });

      //Get remove index

      const removeIndex = post.likes
        .map(like => like.user.toString())
        .indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);
      await post.save();

      return res.status(200).json(post.likes);
    } catch (err) {
      if (err.kind === "ObjectId")
        return res.status(404).json({ msg: "No post was found" });
      console.log(err);
      return res.status(500).send("server error");
    }
  }
);

// @ POST api/posts/comment/:PostID
// @desc comment on a post
// @access Private
router.post(
  "/comment/:PostID",

  passport.authenticate("jwt", { session: false }),

  async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) return res.status(400).json(errors);

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.PostID);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);
      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

// @ DELETE api/posts/comment/:PostID/:CommentID
// @desc remove a comment
// @access Private
router.delete(
  "/comment/:PostID/:CommentID",

  passport.authenticate("jwt", { session: false }),

  async (req, res) => {
    try {
      const post = await Post.findById(req.params.PostID);

      // Pull comment
      const comment = await post.comments.find(
        comment => comment.id === req.params.CommentID
      );

      //Make sure comment exists
      if (!comment)
        return res.status(404).json({ msg: "Comment does not exist" });

      //Check user
      if (comment.user.toString() !== req.user.id)
        return res.status(401).json({ msg: "Unauthorized request" });

      const removeIndex = post.comments
        .map(comment => comment.id)
        .indexOf(req.params.CommentID);

      post.comments.splice(removeIndex, 1);
      await post.save();
      return res.json(post.comments);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
