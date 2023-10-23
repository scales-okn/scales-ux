const chai = require('chai');
const app = require('../../build/index.js');
const request = require('supertest')(app.default);
const panelSchema = require('../fixtures/panelSchema.js');
const chaiJsonSchema = require('chai-json-schema');
const token = require('../fixtures/token.js');
chai.use(chaiJsonSchema);

describe('Panels API', () => {
  it('should return all panels', (done) => {
    request
      .get('/api/panels')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('panels');
        chai.expect(res.body.data.panels).to.be.an('array');
        res.body.data.panels.forEach(panel => chai.expect(panel).to.be.jsonSchema(panelSchema));
        done();
      }
    );
  });

  it('should return a panel', (done) => {
    request
      .get('/api/panels/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('panel');
        chai.expect(res.body.data.panel).to.be.an('object');
        chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
        done();
      }
    );
  });

  it('should create a panel', (done) => {
    request
      .post('/api/panels/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send({
        title: 'Test Panel',
        description: 'This is a test panel',
        collaborators: [],
        visibility: 'public',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('panel');
        chai.expect(res.body.data.panel).to.be.an('object');
        chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
        done();
      }
    );
  });

  it('should update a panel', (done) => {
    request
      .put('/api/panels/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send({
        title: 'Test Panel',
        description: 'This is a test panel',
        collaborators: [],
        visibility: 'public',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('panel');
        chai.expect(res.body.data.panel).to.be.an('object');
        chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
        done();
      }
    );
  });

  it('should delete a panel', (done) => {
    request
      .delete('/api/panels/2/')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        chai.expect(res.body.data).to.be.have.key('panel');
        chai.expect(res.body.data.panel).to.be.an('object');
        chai.expect(res.body.data.panel).to.be.jsonSchema(panelSchema);
        done();
      }
    );
  });
});
