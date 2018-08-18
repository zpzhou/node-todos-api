const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5b70b8f570f8e1d837b9ecf9';

if (!ObjectID.isValid(id)) {
    return console.log('ID is not valid');
}

User.findById(id).then((user) => {
if (!user) {
        return console.log('User not found');
    }
    console.log('User', user.email);
}, (err) => {
    console.log(e);
});