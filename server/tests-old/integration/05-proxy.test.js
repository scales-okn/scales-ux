const chai = require('chai');
const app = require('../../build/index.js');
const request = require('supertest')(app.default);
const infoSchema = require('../fixtures/infoSchema.js');
const chaiJsonSchema = require('chai-json-schema');
const ring = require('../fixtures/ring.js');
chai.use(chaiJsonSchema);
 

describe('Proxy API Requests', () => {


  //TOOD Check for all rings;
  // it.only("should get info", (done) => {
  //   request
  //     .get(`/proxy/rings/${ring.rid}/${ring.version}`)
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) return done(err);
  //       chai.expect(JSON.parse(res.text)).to.be.jsonSchema(infoSchema)
  //       done();
  //     });
  // });
  

});
