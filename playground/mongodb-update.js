const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log(err);
        return;
    }
    const db = client.db('TodoApp');

    db.collection('Todos').findOneAndUpdate({
        _id: new ObjectID('5b70a430da69319f87c6f905')
    }, {
        $set: {
            complete: true
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5b70a1e0e7622fd5b6708c0f')
    }, {
        $set: {
            name: "Foobar"
        },
        $inc: {
            age: 1,
            newCounter: 11
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    });

});
