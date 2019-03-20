const express = require("express");
const router = express.Router();

// @ GET api/users/test
// @desc testing users
// @access public
router.get("/test", (req, res) => res.json({ msg: "users working" }));

module.exports = router;
