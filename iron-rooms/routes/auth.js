const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("signup.hbs");
});

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    successRedirect: "/"
  })
);

// GET /auth/github
router.get("/github", passport.authenticate("github"));

// GET /auth/github/callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/login",
    successRedirect: "/"
  })
);

router.get("/login", (req, res) => {
  res.render("login.hbs", { message: req.flash("error") });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true
  })
);

router.post("/signup", (req, res, next) => {
  // const username = req.body.username;
  // const password = req.body.password;
  const { username, password } = req.body;

  if (!username) {
    res.render("signup.hbs", { message: "Username can't be empty" });
    return;
  }
  if (password.length < 8) {
    res.render("signup.hbs", { message: "Password is too short" });
    return;
  }
  User.findOne({ username: username })
    .then(found => {
      if (found) {
        res.render("signup.hbs", { message: "Username is already taken" });
        return;
      }
      return bcrypt
        .genSalt()
        .then(salt => {
          return bcrypt.hash(password, salt);
        })
        .then(hash => {
          return User.create({ username: username, password: hash });
        })
        .then(newUser => {
          //   authenticating the user with passport
          req.login(newUser, err => {
            if (err) next(err);
            else res.redirect("/");
          });
        });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/logout", (req, res, next) => {
  // passport logout
  req.logout();
  res.redirect("/");
});

module.exports = router;
