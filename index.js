const express = require("express"),
    morgan = require("morgan"),
    bodyParser = require("body-parser"),
    uuid = require("uuid");

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops, something went wrong!');
});

let movies = [
    {
    title: "Terminator",
    description: "top ten movie",
    genres: {
        name: "Sci-Fi",
        description: ""
    },
    director: {
        name: "James Cameron",
        bio: "James Cameron is most famous for raising the bar in an episode of South Park."
    },
    imageUrl: "#"
    },
    {
    title: "movie two",
    description: "top ten movie",
    genres: {
        name: "",
        description: ""
    },
    director: {
        name: "",
        bio: ""
    },
    imageUrl: "#"
    },
    {
    title: "movie three",
    description: "top ten movie",
    genres: {
        name: "",
        description: ""
    },
    director: {
        name: "",
        bio: ""
    },
    imageUrl: "#"
    },
    {
    title: "movie four",
    description: "top ten movie",
    genres: {
        name: "",
        description: ""
    },
    director: {
        name: "",
        bio: ""
    },
    imageUrl: "#"
    },
    {
    title: "movie five",
    description: "top ten movie",
    genres: {
        name: "",
        description: ""
    },
    director: {
        name: "",
        bio: ""
    },
    imageUrl: "#"
    },
];

let users = [
    {
        Username: "John Connor",
        Password: "",
        Email: "",
        Birthday: ""
    }
];

// get list of data for all movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

// get data about a single movie, by title
app.get('/movies/:title', (req, res) => {
    res.json(movies.find((movie) => 
    { return movie.title === req.params.title }));
});

// get genre description by name
app.get('/movies/genres/:name', (req, res) => {
    res.json(movies.find((movie) =>
    { return movie.genres.name === req.params.name }));
});

// get data about a director by name
app.get('/movies/directors/:name', (req, res) => {
    res.send('Successful GET request returning data on director: ' + req.params.name);
});

// Allow new users to register
app.post('/users', (req, res) => {
    res.send('Successful POST request registering new user');
});

// Allow users to update their info (username)
app.put('/users/:Username', (req, res) => {
    res.send('Successful PUT request updating username to ' + req.params.Username);
});

// Allow users to add a movie to their list of favorites
app.post('/users/:Username/favorites/:movieID', (req, res) => {
    res.send('Successful POST request adding movie with ID: ' + req.params.movieID + ' to favorites list of ' + req.params.Username);
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/favorites/:movieID', (req, res) => {
    res.send('Successful DELETE request removing movie with ID: ' + req.params.movieID + ' from favorites list of ' + req.params.Username);
});

// Allow existing users to deregister
app.delete('/users/:Username', (req, res) => {
    res.send('Successful DELETE request removing user: ' + req.params.Username + ' from database');
});

app.get('/', (req, res) => {
    res.send('Welcome to flixNET!');
});

app.listen(8080, () => {
    console.log('flixNET is listening on port 8080.');
});
