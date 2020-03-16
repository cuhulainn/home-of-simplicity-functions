const functions = require('firebase-functions');

const app = require('express')();

const { getAllMeals, postOneMeal } = require('./handlers/meals');
const { signup, login } = require('./handlers/users');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// Meal routes
app.get(`/meals`, getAllMeals);
app.post('/meal', postOneMeal);

// User routes
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
