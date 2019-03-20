const express = require("express");
const router = express.Router();

// @ GET api/profile/test
// @desc testing profile
// @access public
router.get("/test", (req, res) => res.json({ msg: "profile working" }));

module.exports = router;
