const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
})

const User = mongoose.model("users", UserSchema)
module.exports = User