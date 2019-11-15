const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../models/User");
const Comment = require("../models/Comment");

/* GET home page */
router.get("/", (req, res) => {
  res.render("index", { loggedIn: req.user });
});

const loginCheck = () => {
  return (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/");
    }
  };
};

router.get("/profile", loginCheck(), (req, res, next) => {
  Room.find({ owner: req.user._id })
    .then(rooms => {
      res.render("profile.hbs", { user: req.user, rooms: rooms });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/new", loginCheck(), (req, res) => {
  res.render("roomForm.hbs");
});

router.get("/rooms", (req, res, next) => {
  Room.find()
    .then(rooms => {
      res.render("rooms.hbs", { rooms: rooms });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:roomId", loginCheck(), (req, res, next) => {
  Room.findById(req.params.roomId)
    .populate("owner") // populates the `owner` field in the Room
    .populate({
      path: "comments", // populates the `comments` field in the Room
      populate: {
        path: "author" // populates the `author` field in the Comment
      }
    })
    .then(room => {
      res.render("roomDetail.hbs", {
        layout: false,
        room: room,
        showDelete:
          room.owner._id.toString() === req.user._id.toString() ||
          req.user.role === "admin"
      });
    })
    .catch(err => {
      next(err);
    });
});

// loginCheck will prevent non logged in users from creating a room
router.post("/rooms", loginCheck(), (req, res, next) => {
  Room.create({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    owner: req.user._id
  })
    .then(room => {
      res.redirect(`/rooms/${room._id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/user/:userId", (req, res, next) => {
  User.findById(req.params.userId)
    .then(user => {
      return Room.find({ owner: req.params.userId }).then(rooms => {
        res.render("rooms.hbs", { rooms: rooms, user: user });
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/rooms/:roomId/delete", loginCheck(), (req, res, next) => {
  const query = { _id: req.params.roomId };

  if (req.user.role !== "admin") {
    query.owner = req.user._id;
  }

  // if the user that made the request is the one that created the room:
  // delete the room where the `_id` of the room is the one from the params and the `owner` of the room is the user who made the request

  Room.deleteOne(query)
    .then(() => {
      res.redirect("/rooms");
    })
    .catch(err => {
      next(err);
    });
});

router.post("/rooms/:roomId/comment", loginCheck(), (req, res, next) => {
  const content = req.body.comment;
  const author = req.user._id;

  Comment.create({
    content: content,
    author: author
  })
    .then(comment => {
      return Room.findOneAndUpdate(
        { _id: req.params.roomId },
        {
          $push: {
            comments: comment._id
          }
        },
        {
          new: true
        }
      )
        .populate({
          path: "comments", // populates the `comments` field in the Room
          populate: {
            path: "author" // populates the `author` field in the Comment
          }
        })
        .then(room => {
          res.json(room.comments); // updated comments array

          // send the room's document
          // res.redirect(`/rooms/${req.params.roomId}`);
        });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/rooms/:roomId/update", loginCheck(), (req, res, next) => {
  Room.updateOne(
    { _id: req.params.roomId },
    {
      coordinates: req.body.coordinates
    }
  )
    .then(() => {
      res.json();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
