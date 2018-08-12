const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');


var app = express();

// pass JSON to post handler
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let newTodo = new Todo({
        text: req.body.text
    });
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
    console.log(req.body);
});

app.listen(8080, () => {
    console.log('Server started on port 8080');
});
