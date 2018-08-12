const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('Unable to connect to MongoDB server');
        return;
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    /*db.collection('Todos').insertOne({
        text: 'foo',
        completed: false
    }, (err, res) => {
        if (err) {
            console.log('Unable to insert todo', err);
            return;
        }
        console.log(JSON.stringify(res.ops, undefined, 2));
    });*/
    /*db.collection('Users').insertOne({
        name: 'Peter',
        age: '23',
        location: 'SAP'
    }, (err, res) => {
        if (err) {
            console.log('Unable to insert user', err);
            return;
        }

        const ts = res.ops[0]._id.getTimestamp();
        console.log(ts);
    });*/

    client.close();
});