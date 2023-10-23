const chai = require('chai');
const app = require('../../build/index.js');
const request = require('supertest')(app.default);
const userSchema = require('../fixtures/userSchema.js');
const chaiJsonSchema = require('chai-json-schema');
const token = require('../fixtures/token.js');
chai.use(chaiJsonSchema);

describe('Users API', () => {
  it('should return all users', (done) => {
    request
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('users');
        chai.expect(res.body.data.users).to.be.an('array');
        res.body.data.users.forEach(user => chai.expect(user).to.be.jsonSchema(userSchema));
        done();
      });
  });
  it('should return a user', (done) => {
    request
      .get('/api/users/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('user');
        chai.expect(res.body.data.user).to.be.an('object');
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      });
    });


  it('should create a user', (done) => {
    request
      .post('/api/users/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
        firstName: 'Test',
        lastName: 'User',
        usage: 'test',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('user');
        chai.expect(res.body.data.user).to.be.an('object');
        chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
        done();
      });
    });

    it('should update a user', (done) => {
      request
        .put('/api/users/2/')
        .set('Accept', 'application/json')  
        .set('Authorization', token)
        .send({
          usage: 'testuser',
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          chai.expect(res.body.data).to.be.have.key('user');
          chai.expect(res.body.data.user).to.be.an('object');
          chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
          done();
        });
      });


    it('should delete a user', (done) => {
      request
        .delete('/api/users/2/')
        .set('Accept', 'application/json') 
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          chai.expect(res.body.data).to.be.have.key('user');
          chai.expect(res.body.data.user).to.be.an('object');
          chai.expect(res.body.data.user).to.be.jsonSchema(userSchema);
          done();
        });
    });
    
  });