require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');


var app = express();
const port = process.env.PORT;

// pass JSON to post handler
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    let newTodo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({
            todos: todos
        });
    }, (err) => {
        res.status(500).send(e);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOne({
       _id: id,
       _creator: req.user._id
    }).then((todo) => {
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

app.delete('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
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

app.patch('/todos/:id', authenticate, (req, res) => {
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

    let oQueryParams = {
        _id: id,
        _creator: req.user._id
    };
    let oUpdateParams = {
        $set: oBody
    };
    let oOptions = {
        new: true
    };

    Todo.findOneAndUpdate(oQueryParams, oUpdateParams, oOptions).then((todo) => {
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
        res.status(400).send({err});
    });
});

app.post('/users', (req, res) => {
    let sEmail = req.body.email;
    let sPassword = req.body.password;
    let newUser = new User({
        email: sEmail,
        password: sPassword
    });
    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send({
            message: `User for ${sEmail} successfuly created`,
            user: newUser,
        });
    })
    .catch((err) => {
        res.status(400).send({err});
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    let loggendInUser;
    User.findByCredentials(req.body.email, req.body.password).then((user) => {
        loggedInUser = user;
        return user.generateAuthToken();
    }, (err) => {
        res.status(401).send({err});
    }).then((token) => {
        res.header('x-auth', token).send({
            message: `Welcome ${req.body.email}!`,
            user: loggendInUser
        });
    }).catch((err) => {
        res.status(400).send({err});
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = {app};
