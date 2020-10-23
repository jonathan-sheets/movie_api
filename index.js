const express = require("express"),
    morgan = require("morgan");

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops, something went wrong!');
});

let topMovies = [
    {
    title: "movie one",
    description: "top ten movie"
    },
    {
    title: "movie two",
    description: "top ten movie"
    },
    {
    title: "movie three",
    description: "top ten movie"
    },
    {
    title: "movie four",
    description: "top ten movie"
    },
    {
    title: "movie five",
    description: "top ten movie"
    },
    {
    title: "movie six",
    description: "top ten movie"
    },
    {
    title: "movie seven",
    description: "top ten movie"
    },
    {
    title: "movie eight",
    description: "top ten movie"
    },
    {
    title: "movie nine",
    description: "top ten movie"
    },
    {
    title: "movie ten",
    description: "top ten movie"
    }
];

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Welcome to flixNET!');
});

app.listen(8080, () => {
    console.log('flixNET is listening on port 8080.');
});
