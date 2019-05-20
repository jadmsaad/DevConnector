const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");
const User = require("../../Models/User");
const config = require("config");
const { check, validationResult } = require("express-validator/check");

//@route GET api/auth
//@desc authenticate registered user
//@access private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = User.findById(req.user.id).select("-password");

      res.json(user);
    } catch (err) {
      console.log("Server Error");
      res.status(500).send(err.message);
    }
  }
);

// @ POST api/auth
// @desc authenticate user and get token
// @access public
router.post(
  "/auth",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "please enter a password").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;

      let user = await User.findOne({ email });

      if (!user) {
        errors = ["Invalid credentials"];
        return res.status(400).json(errors);
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });

      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign Token
      jwt.sign(
        payload,
        config.get("secretOrKey"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token: "Bearer " + token
          });
        }
      );
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
    }
  }
);

module.exports = router;
