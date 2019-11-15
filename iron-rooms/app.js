require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");

mongoose
  .connect("mongodb://localhost/passport-auth", { useNewUrlParser: true })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

hbs.registerPartials(__dirname + "/views/partials");

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 24 * 60 * 60 },
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/User");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
});

const bcrypt = require("bcrypt");
const flash = require("connect-flash");
app.use(flash());

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
      .then(user => {
        if (!user) {
          done(null, false, { message: "Invalid credentials" });
          return;
        }
        return bcrypt.compare(password, user.password).then(bool => {
          if (bool === false) {
            done(null, false, { message: "Invalid credentials" });
          } else {
            // passwords match
            done(null, user);
          }
        });
      })
      .catch(err => {
        done(err);
      });
  })
);

// const GithubStrategy = require("passport-github").Strategy;

// passport.use(
//   new GithubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/github/callback"
//     },
//     (accessToken, refreshToken, profile, done) => {
//       User.findOne({ githubId: profile.id })
//         .then(user => {
//           if (user) {
//             // log the user in
//             done(null, user);
//           } else {
//             return User.create({ githubId: profile.id }).then(newUser => {
//               // log user in
//               done(null, newUser);
//             });
//           }
//         })
//         .catch(err => {
//           done(err);
//         });
//     }
//   )
// );

// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/callback"
//     },
//     (accessToken, refreshToken, profile, done) => {
//       User.findOne({ googleId: profile.id })
//         .then(user => {
//           if (user) {
//             done(null, user);
//           } else {
//             return User.create({
//               googleId: profile.id,
//               name: profile.displayName
//             }).then(newUser => {
//               done(null, newUser);
//             });
//           }
//         })
//         .catch(err => {
//           done(err);
//         });
//     }
//   )
// );

app.use(passport.initialize());
app.use(passport.session());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// default value for title local
app.locals.title = "IronBNB";

const index = require("./routes/index");
app.use("/", index);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

module.exports = app;
