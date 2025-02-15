const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
const { Connect, isConnected } = require("./db");
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const {signUpRouter, LoginRouter, GoogleRouter, responsesRouter, uploadRouter} = require('./routes/routes')


const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Connect to MongoDB
Connect()
    .then(() => {
        console.log("Connected to MongoDB");
        // Start the server after successful connection
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server running on port ${process.env.PORT || 3000}`);
        });
    }).catch((error) => {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    });


// Routes
app.use("/", signUpRouter)
app.use("/", LoginRouter)
app.use("/", GoogleRouter)
app.use("/", responsesRouter)
app.use("/", uploadRouter)

mongoose.connection.once('open', () => {
    console.log("Connected to mongoDB");
});

module.exports = app;
