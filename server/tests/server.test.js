const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos/')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should not create todo with bad body data', (done) => {
        request(app)
            .post('/todos/')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos/')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const id = todos[0]._id.toHexString();
        const mockId = parseInt(id[0]) + 1 + id.slice(1);
        request(app)
            .get(`/todos/${mockId}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBeTruthy();
            })
            .end(done);
    });

    it('should return 404 if id invalid', (done) => {
        const mockId = 'invalidId';
        request(app)
            .get(`/todos/${mockId}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        let hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).not.toBeTruthy();
                    done()
                }).catch((err) => done(err));
            });
    });

    it('should return 404 if todo not found', (done) => {
        let id = todos[0]._id.toHexString();
        let mockId = parseInt(id[0]) + 1 + id.slice(1);

        request(app)
            .delete(`/todos/${mockId}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBeDefined();
            })
            .end(done);
    });

    it('should return 404 if object id invalid', (done) => {
        let mockId = 'mockId';

        request(app)
            .delete(`/todos/${mockId}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update todo', (done) => {
        let id = todos[0]._id.toHexString();
        let sPath = `/todos/${id}`;
        let oBody = {
            completed: true,
            text: 'complete'
        };

        request(app)
            .patch(sPath)
            .send(oBody)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.text).toBe(oBody.text)
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id).then((todo) => {
                    expect(todo.completed).toBe(true);
                    expect(todo.text).toBe(oBody.text);
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });

    it('should clear completedAt when not completed', (done) => {
        let id = todos[1]._id.toHexString();
        let sPath = `/todos/${id}`;
        let oBody = {
            completed: false,
            text: 'imcomplete'
        };

        request(app)
            .patch(sPath)
            .send(oBody)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.text).toBe(oBody.text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id).then((todo) => {
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toBe(null);
                    expect(todo.text).toBe(oBody.text);
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('shoudl 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = 'password';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                console.log(res);
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body.user._id).toBeTruthy();
                expect(res.body.user.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).toNotBe(password);
                });
                done();
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var badEmail = 'badEmail';
        var shortPassword = 'foo';

        request(app)
            .post('/users')
            .send({badEmail, shortPassword})
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({badEmail, shortPassword}).then((user) => {
                    expect(user).toBeFalsy();
                });
                done();
            });
    });

    it('should not create user if email in use', (done) => {
        var email = 'example@example.com';
        var password = 'password';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .end(() => {});

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.find({email, password}).then((users) => {
                    expect(users.length).toBe(1);
                });
                done();
            });
    });
})