/**
 * Imports all modules needed for the API
 */
const express = require("express"),
    morgan = require("morgan"),
    bodyParser = require("body-parser"),
    uuid = require("uuid"),
    passport = require('passport'),
    cors = require('cors');
    require('./passport');
const { check, validationResult } = require('express-validator');

/**
 * Import object models from Mongoose
 */
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

/**
 * Connects MongoDB database
 */
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// The line below uses local database created on my machine
// mongoose.connect('mongodb://localhost:27017/flixNETDB', { useNewUrlParser: true, useUnifiedTopology: true }); 

/**
 * Allows the use of express
 */
const app = express();

app.use(bodyParser.json()); // bodyParser middleware function
app.use(cors()); // Allows use of CORS (Cross-Origin Resource Sharing)
/**
 * Imports auth.js file and ensures that Express is available in auth.js file
 */
let auth = require('./auth')(app);

/**
 * When the user enters a url into the browser this logs a timestamp and pathName to the console
 */
app.use(morgan('common'));

/**
 * This serves the "documentation.html" file to the browser
 */
app.use(express.static('public'));

/**
 * This is the error handling function
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops, something went wrong!');
});

/**
 * API REQUEST TYPES AND THEIR METHODS
 */

 /**
  * This shows the default message
  * @param req
  * @param res
  */
app.get('/', (req, res) => {
    res.send('Welcome to flixNET!');
});

/**
 * This gets the list of data for all movie objects
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
      .then((movies) => {
          res.status(201).json(movies);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

/**
 * This gets data about a single movie, by title
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req,res) => {
    Movies.findOne({ Title: req.params.Title }) // This finds a movie by its title
      .then((movie) => {
          res.status(201).json(movie); // This returns the movie object in JSON format
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

/**
 * This gets data about a specific genre by its name
 */
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name }) // This finds a genre by its name
      .then((movie) => {
          res.status(201).json(movie.Genre.Name + ":  " + movie.Genre.Description);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

/**
 * This gets data about a specific director by name
 */
app.get('/movies/directors/:Name',passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })  // This finds a directer by their name
      .then((movie) => {
          res.status(201).json(movie.Director.Name + ":  " + movie.Director.Bio + "  " + "Born: " + movie.Director.Birth + "  " + "Died: " + movie.Director.Death);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

/**
 * This allows a new user to register
 * For endpoint testing we'll expect JSON in this format
 * {
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
   }
 */
app.post('/users',
  // The following lines use "express validator" which validates many types of input data
  [
      check('Username', 'Username is required').isLength({min: 5}),
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
      // Check the validation object for errors
      let errors = validationResult(req);
      // Verifies there were no errors and returns a list of errors if any are present
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
      }

    let hashedPassword = Users.hashPassword(req.body.Password); // hashes the password stored in the database
    Users.findOne({ Username: req.body.Username })  // queries the "Users" model using mongoose
        .then((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              })
              .then((user) =>{res.status(201).json(user) }) // sends new user info back as a JSON response
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
});

/**
 * This returns a list of all users.  ONLY USED IN TESTING
 */
// app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Users.find()
//       .then((users) => {
//           res.status(201).json(users);
//       })
//       .catch((err) => {
//           console.error(err);
//           res.status(500).send('Error: ' + err);
//       });
// });

/**
 * This returns data for a specific user by their username
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    Users.findOne({ Username: req.params.Username }) // finds the user by username
      .then((user) => {
          res.json(user); // returns user info in JSON format
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

/**
 * This allows a user to update their information
 * For endpoint testing we'll expect JSON in this format
 * {
    Username: String,
    (required)
    Password: String,
    (required)
    Email: String,
    (required)
    Birthday: Date
   }
 */
app.put('/users/:Username',
// The following lines use "express validator" which validates many types of input data
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], 
passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    // Check the validation object for errors
    let errors = validationResult(req);
      // Verifies there were no errors and returns a list of errors if any are present
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
      }

    let hashedPassword = Users.hashPassword(req.body.Password); // hashes the password stored in the database
    
    Users.findOneAndUpdate({ Username: req.params.Username }, // finds a user by username and updates their info
    { $set:
        {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
        }
},
{ new: true }, //This line makes sure that the updated document is returned
(err, updatedUser) => {
    if(err) { // Shows an error if there is one
        console.error(err);
        res.status(500).send('Error: ' + err);
    } else {
        res.json(updatedUser); // Returns the updated user info in JSON format
    }
  });
});

/**
 * This allows a user to add a movie to their favorites
 */
app.post('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', 
  { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { // Finds a user by username
        $push: { FavoriteMovies: req.params.MovieID } // Adds a movie by ID to user's favorites
    },
    { new: true }, // This line makes sure the updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser); // Returns updated user info in JSON format if there are no errors
        }
    });
});

/**
 * This allows a user to remove a movie from their favorites
 */
app.delete('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', 
  { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { // Finds a user by username
        $pull: { FavoriteMovies: req.params.MovieID } // Removes a movie by ID from user's favorites
    },
    { new: true }, // This line makes sure the updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser); // Returns updated user info in JSON format if there are no errors
        }
    });
});

/**
 * This allows a user to delete their profile and removes them from the database
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username }) // Finds a user by username and removes them from the database
      .then((user) => {
          if (!user) {
              res.status(400).send(req.params.Username + ' was not found'); // Shown if username was not found in database
          } else {
              res.status(200).send(req.params.Username + ' was deleted.'); // Shown if the username was found in the database and removed
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

/**
 * This listens for requests and looks for a pre-configured port number in the environment variable.
 * If nothing is found it sets the port to 8080
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});