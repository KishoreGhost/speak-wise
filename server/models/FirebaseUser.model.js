const mongoose = require("mongoose");

const FireBaseUserSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  photoURL: { type: String },
  googleId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FireBaseUser = mongoose.model("FireBaseUser", FireBaseUserSchema);
module.exports = FireBaseUser;