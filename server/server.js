const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');


var app = express();
const port = process.env.PORT || 8080;

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

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos: todos
        });
    }, (err) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findById(id).then((todo) => {
        if (!todo) {
            res.status(404).send({
                message: `${id} not found`
            });
        }
        res.status(200).send({
            todo: todo
        });
    }).catch((err) => {
        res.status(400).send({
            message: 'foo'
        });
    });
});

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            res.status(404).send({
                message: `${id} was not found`
            });
        }
        res.status(200).send({
            message: `${id} successfully deleted`,
            todo: todo
        });
    }, (err) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    let id = req.params.id;
    let oBody = {
        text: req.body.text,
        completed: req.body.completed
    };

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (typeof oBody.completed === 'boolean' && oBody.completed) {
        oBody.completedAt = new Date().getTime();
    } else {
        oBody.completed = false;
        oBody.completedAt = null;
    }

    console.log(oBody);
    Todo.findByIdAndUpdate(id, {$set: oBody}, {$new: true}).then((todo) => {
        if (!todo) {
            res.status(404).send({
                message: `${id} not found`
            });
        }
        res.status(200).send({
            message: `${id} successfully updated`,
            todo: todo
        });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = {app};
