const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log(err);
        return;
    }
    const db = client.db('TodoApp');

    // delete many
    db.collection('Users').deleteMany({
        name: 'Peter'
    }).then((result) => {
        console.log(result);
    });

    // delete one
    /*db.collection('Todos').deleteOne({
        text: 'Eat lunch'
    }).then((result) => {
        console.log(result);
    });*/

    // find one and delete
    db.collection('Users').findOneAndDelete({
        _id: new ObjectID('5b70a1f17edba9d5b7b6c3a7')
    }).then((result) => {
        console.log(result);
    });

});