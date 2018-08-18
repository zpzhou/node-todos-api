const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5b789211f92360f621faf0aa';

Todo.findByIdAndRemove(id).then((doc) => {
    console.log(doc);
});