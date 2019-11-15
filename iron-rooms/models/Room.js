const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  price: Number,
  name: String,
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  coordinates: [Number]
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
