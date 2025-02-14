const express = require('express')
const User = require('../models/user.model')
const FireBaseUser = require('../models/FirebaseUser.model')
const Responses = require('../models/responses.model')
const bcrypt = require('bcrypt')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const GoogleRouter = express.Router()

const signUpRouter = express.Router()
const LoginRouter = express.Router()
const responsesRouter = express.Router()

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
  
      res.status(200).json({ token, user: {_id: user._id} });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  GoogleRouter.post('/google-signup', async (req, res) => {
    try {
      const { name, email, photoURL, uid } = req.body;
  
      // Check if the user already exists in the database
      let user = await FireBaseUser.findOne({ email });
  
      if (!user) {
        // Create new user
        user = new FireBaseUser({
          name, // Assuming you have updated the schema to include 'name'
          email,
          photoURL,
          googleId: uid,
        });
  
        await user.save();
      }
  
      res.status(200).json({ message: "User stored successfully", user });
    } catch (error) {
      console.error("Google Signup Error:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  });

responsesRouter.post('/responses', async(req, res) => {
  const {userId, answers} = req.body
  try{
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const response = new Responses({
      userId,
      answers,
    });

    await response.save();
    res.status(200).json({ message: 'Response saved successfully.' });
  }catch (error) {
    console.error("Error saving response:", error.message, error.stack); // Add error details
    res.status(500).json({ error: 'Internal server error.' });
  }  
})


module.exports = {LoginRouter, signUpRouter, GoogleRouter, responsesRouter}