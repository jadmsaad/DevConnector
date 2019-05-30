const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const request = require("request");
const config = require("config");

//Load Validation
const validateProfileInput = require("../../Validation/profile");

const validateExperienceInput = require("../../Validation/experience");
const validateEducationInput = require("../../Validation/education");
//Load Profile Model
const Profile = require("../../Models/Profile");

//Load User Model
const User = require("../../Models/User");

// @ GET api/profile/test
// @desc testing profile
// @access public
router.get("/test", (req, res) => res.json({ msg: "profile working" }));

// @ GET api/profile/
// @desc Get Current user's profile
// @access private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = [];
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.push("There is no profile for this user");
          return res.status(404).json(errors);
        }

        return res.json(profile);
      })
      .catch(err => res.status(400).json(err));
  }
);

// @ GET api/profile/test
// @desc testing profile
// @access public
router.get("/test", (req, res) => res.json({ msg: "profile working" }));

// @ GET api/profile/handle/:handle
// @desc Get profile by handle
// @access public

// @ POST api/profile/
// @desc Create or edit user's profile
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).send(errors);
    }
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    // if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubUserName)
      profileFields.githubUserName = req.body.githubUserName;
    //Skills - Split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create
        new Profile(profileFields).save().then(profile => res.json(profile));
        // Check if handle exists
        // Profile.findOne({ handle: profileFields.handle }).then(profile => {
        //   if (profile) {
        //     errors.handle = "That handle already exists";
        //     return res.status(400).json(errors);
        //   }

        //   // Save Profile

        // });
      }
    });
  }
);

// @route GET api/profile
// @desc Get all profiles
// @access Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET api/profile/user/:user_id
// @desc Get profile by id
// @access Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) res.status(400).json({ msg: "Profile was not found" });

    res.json(profile);
  } catch (err) {
    if (err.kind == "ObjectId")
      res.status(400).json({ msg: "Profile was not found" });
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route DELETE api/profile
// @desc Delete profile,user and posts
// @access Private

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // @todo - remove users posts
      //Remove profile
      await Profile.findOneAndRemove({ user: req.user.id });
      //Remove User
      await User.findOneAndRemove({ _id: req.user.id });
      res.json({ msh: "Deleted" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route PUT api/experience
// @desc Add profile experience
// @access Private
router.put(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// @route DELETE api/profile/experience
// @desc delete experience from profile
// @access Private

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //Get remove indexawait
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      profile.experience.splice(removeIndex, 1);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// @route PUT api/profile/education
// @desc Add profile education
// @access Private
router.put(
  "/education",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route DELETE api/profile/education
// @desc delete education from profile
// @access Private

router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //Get remove indexawait
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      profile.education.splice(removeIndex, 1);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// @route GET api/profile/github/username
// @desc Get user repos from Github
// @access Public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubID"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "server error" });
  }
});

module.exports = router;
