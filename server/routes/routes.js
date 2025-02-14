const express = require('express')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const signUpRouter = express.Router()
const LoginRouter = express.Router()

signUpRouter.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log("Request received:", req.body); // Log incoming request
  
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log("User already exists:", email); // Log duplicate email
        return res.status(400).json({ message: "Email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed Password:", hashedPassword); // Log password hash
  
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
  
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
  
      console.log("Token generated:", token); // Log JWT token
      res.status(201).json({ token });
    } catch (error) {
      console.error("Signup error:", error.message); // Log server error
      res.status(500).json({ message: "Server error" });
    }
  });
  

LoginRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
  
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = {LoginRouter, signUpRouter}