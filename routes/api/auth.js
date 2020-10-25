const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

//@route    GET api/auth
//@desc     Auth route
//@access   Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/admin", auth, async (req, res) => {
  try {
    if (req.user.roles !== "Admin") {
      console.log("error");
      res.status(403).send("Unauthorized..");
    } else {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/instructor", auth, async (req, res) => {
  try {
    if (req.user.roles !== "Instructor") {
      console.log("error");
      res.status(403).send("Unauthorized..");
    } else {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/simple-user", auth, async (req, res) => {
  try {
    if (req.user.roles !== "SimpleUser") {
      console.log("error");
      res.status(403).send("Unauthorized..");
    } else {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    POST api/auth
//@desc     Authenticate user & get token
//@access   Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      // see if user doesnt exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // Return jwt
      const payload = {
        user: {
          id: user.id,
          roles: user.roles,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
