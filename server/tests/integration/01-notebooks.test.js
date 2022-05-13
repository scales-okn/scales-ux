const chai = require('chai');
const app = require('../../build/index.js');
const request = require('supertest')(app.default);
const notebookSchema = require('../fixtures/notebookSchema.js');
const chaiJsonSchema = require('chai-json-schema');
const token = require('../fixtures/token.js');
chai.use(chaiJsonSchema);
 
describe('Notebooks API', () => {
  it('should return all notebooks', (done) => {
    request
      .get('/api/notebooks')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('notebooks');
        chai.expect(res.body.data.notebooks).to.be.an('array');
        res.body.data.notebooks.forEach(notebook => chai.expect(notebook).to.be.jsonSchema(notebookSchema));
        done();
      });
  });

  it('should return a notebook', (done) => {
    request
      .get('/api/notebooks/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('notebook');
        chai.expect(res.body.data.notebook).to.be.an('object');
        chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
        done();
      });
  });

  it('should create a notebook', (done) => {
    request
      .post('/api/notebooks/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send({
        title: 'Test Notebook',
        description: 'This is a test notebook',
        collaborators: [],
        visibility: 'public',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('notebook');
        chai.expect(res.body.data.notebook).to.be.an('object');
        chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
        done();
      });  
  });

  it('should update a notebook', (done) => {
    request
      .put('/api/notebooks/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send({
        title: 'Test Notebook',
        description: 'This is a test notebook',
        collaborators: [],
        visibility: 'public',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('notebook');
        chai.expect(res.body.data.notebook).to.be.an('object');
        chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
        done();

      });
  });

  it('should delete a notebook', (done) => {
    request
      .delete('/api/notebooks/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('notebook');
        chai.expect(res.body.data.notebook).to.be.an('object');
        chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
        done();
      }
    );
  });

  it('should return a notebook with a specific id', (done) => {
    request
      .get('/api/notebooks/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('notebook');
        chai.expect(res.body.data.notebook).to.be.an('object');
        chai.expect(res.body.data.notebook).to.be.jsonSchema(notebookSchema);
        done();
      }
    );
  });
  
});
 
  