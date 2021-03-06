const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
// const keys = require("../../config/keys");

const config = require("config");
const secretOrKey = config.get("secretOrKey");

//Load Input Validation
const validateRegisterInput = require("../../Validation/register");
const validateLoginInput = require("../../Validation/login");

//Load user model
const User = require("../../Models/User");

// @ GET api/users/test
// @desc testing users
// @access public
router.get("/test", (req, res) => res.json({ msg: "users working" }));

// @ POST api/users/register
// @desc Register user
// @access public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              const payload = {
                id: user.id,
                name: user.name,
                avatar: user.avatar
              }; // create jwt paylod

              // Sign Token
              jwt.sign(
                payload,
                secretOrKey,
                { expiresIn: 360000 },
                (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token
                  });
                }
              );
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @ POST api/users/login
// @desc Login User / return JWT
// @access public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Check for User
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.push("User not found");
      return res.status(404).json(errors);
    }
    // chec for password

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // user matched
        const payload = { id: user.id, name: user.name, avatar: user.avatar }; // create jwt paylod

        // Sign Token
        jwt.sign(payload, secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        errors.push("Incorrect Password");
        return res.status(400).json(errors);
      }
    });
  });
});

// @ POST api/users/current
// @desc  return current user
// @access private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      name: req.user.name,
      email: req.user.email,
      id: req.user.id
    });
  }
);

module.exports = router;
