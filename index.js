const express = require("express"),
    morgan = require("morgan"),
    bodyParser = require("body-parser"),
    uuid = require("uuid"),
    mongoose = require("mongoose"),
    Models = require("./models.js"),
    Movies = Models.Movie,
    Users = Models.User;

mongoose.connect('mongodb://localhost:27017/flixNETDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops, something went wrong!');
});

// get list of data for all movies
app.get('/movies', (req, res) => {
    Movies.find()
      .then((movies) => {
          res.status(201).json(movies);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// get data about a single movie, by title
app.get('/movies/:Title', (req,res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
          res.status(201).json(movie);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// get genre description by name
app.get('/movies/genres/:Name', (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then((movie) => {
          res.status(201).json(movie.Genre.Name + ":  " + movie.Genre.Description);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// get data about a director by name
app.get('/movies/directors/:Name', (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
          res.status(201).json(movie.Director.Name + ":  " + movie.Director.Bio + "  " + "Born: " + movie.Director.Birth + "  " + "Died: " + movie.Director.Death);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// Allow new users to register
// Add a user
/* We'll expect JSON in this format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
}*/
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              })
              .then((user) =>{res.status(201).json(user) })
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

// Get all users
app.get('/users', (req, res) => {
    Users.find()
      .then((users) => {
          res.status(201).json(users);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
          res.json(user);
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

// Update a user's info by username
/* We'll expect JSON in this format
{
    Username: String,
    (required)
    Password: String,
    (required)
    Email: String,
    (required)
    Birthday: Date
} */
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    }
},
{ new: true }, //This line makes sure that the updated document is returned
(err, updatedUser) => {
    if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    } else {
        res.json(updatedUser);
    }
  });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/favorites/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, // This line makes sure the updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// Remove a movie from a user's list of favorites
app.delete('/users/:Username/favorites/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, // This line makes sure the updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
          if (!user) {
              res.status(400).send(req.params.Username + ' was not found');
          } else {
              res.status(200).send(req.params.Username + ' was deleted.');
          }
      })
      .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
      });
});

app.get('/', (req, res) => {
    res.send('Welcome to flixNET!');
});

app.listen(8080, () => {
    console.log('flixNET is listening on port 8080.');
});
