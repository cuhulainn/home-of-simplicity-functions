const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyBqmSR9WEn0wXe5ley47m61FGT3gponqh4",
  authDomain: "home-of-simplicity.firebaseapp.com",
  databaseURL: "https://home-of-simplicity.firebaseio.com",
  projectId: "home-of-simplicity",
  storageBucket: "home-of-simplicity.appspot.com",
  messagingSenderId: "611524879779",
  appId: "1:611524879779:web:431598901e48b189cba616",
  measurementId: "G-4X4PH05VJZ"
};

const firebase = require(`firebase`);
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

app.get(`/meals`, (req, res) => {
  db.collection('meals').get()
    .then(data => {
      let meals = [];
      data.forEach(doc => {
        meals.push({
          mealId: doc.id,
          name: doc.data().name,
          menu: doc.data().menu,
          dayOfWeek: doc.data().dayOfWeek,
          description: doc.data().description,
          cost: doc.data().cost,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(meals);
    })
    .catch(err => console.error(err))
})

app.post('/meal', (req, res) => {
  const newMeal = {
    cost: req.body.cost,
    name: req.body.name,
    menu: req.body.menu,
    dayOfWeek: req.body.dayOfWeek,
    description: req.body.description,
    createdAt: new Date().toISOString()
  };

  db.collection('meals')
    .add(newMeal)
    .then(doc => {
      return res.json({ message: `document ${doc.id} created successfully` })
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err)
    })
});

const isEmpty = (str) => {
  if (str.trim() === '') return true;
  else return false
}

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
}


//signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = 'Please enter an email to sign up!'
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Please enter a valid email address!'
  }
  if (isEmpty(newUser.firstName) || isEmpty(newUser.lastName)) errors.name = 'Please enter your first and last name to sign up!'

  if (isEmpty(newUser.password)) errors.password = 'Please enter a password to sign up!';
  if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Please check the passwords, they must match!';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  let token, userId;
  db.doc(`/users/${newUser.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ email: 'This email is already in use' });
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: new Date().toISOString(),
        address: newUser.address,
        userId: userId
      };
      return db.doc(`/users/${newUser.email}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'This email is already in use' })
      }
      return res.status(500).json({ error: err.code })
    });
});

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  let errors = {};

  if (isEmpty(user.email)) errors.email = 'Please enter an email to log in!'
  if (isEmpty(user.password)) errors.password = 'Please enter a password to log in!'
  
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then(data => {
    return data.user.getIdToken();
  })
  .then(token => {
    return res.json({ token });
  })
  .catch(err => {
    console.error(err);
    if (err.code === 'auth/wrong-password') {
      return res.status(403).json({ general: 'Incorrect password, please double check and try again!' })
    } else return res.status(500).json({ error: err.code })
  })
})

exports.api = functions.https.onRequest(app);