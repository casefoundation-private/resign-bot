process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const web = require('./lib/web');
const database = require('./lib/database');
const should = chai.should();
const assert = require('assert');
const randomstring = require('randomstring');

chai.use(chaiHttp);

describe('API',() => {
  let api = null;

  beforeEach(() => {
    return database.init()
      .then(() => {
        return database.knex('reviews').delete();
      })
      .then(() => {
        return database.knex('submissions').delete();
      })
      .then(() => {
        return database.knex('users').delete();
      })
      .then(() => web.init())
      .then((_api) => {
        api = _api;
      });
  });

  describe('User',() => {
    const User = require('./lib/models/user');

    it('GET /api/user/:user',(done) => {
      const user = new User({
        'email': randomstring.generate(),
        'password': randomstring.generate()
      });
      user.save()
        .then(() => {
          chai.request(api)
            .get('/api/user/' + user.get('id'))
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.id.should.be.eql(user.get('id'));
              res.body.email.should.be.eql(user.get('email'));
              res.body.password.should.be.eql(user.get('password'));
              done();
            });
        })
        .catch((err) => done(err));
    });

    it('POST /api/user/:user',(done) => {
      const user = new User({
        'email': randomstring.generate(),
        'password': randomstring.generate()
      });
      const newPass = randomstring.generate();
      user.save()
        .then(() => {
          chai.request(api)
            .post('/api/user/' + user.get('id'))
            .send({
              'password': newPass
            })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.id.should.be.eql(user.get('id'));
              res.body.email.should.be.eql(user.get('email'));
              res.body.password.should.be.eql(newPass);
              done();
            });
        })
        .catch((err) => done(err));
    });
  });

  describe('Submission',() => {
    const Submission = require('./lib/models/submission');
    const submissions = [];

    before(() => {
      const saves = [];
      for(var i = 0; i < 10; i++) {
        const object = new Submission({
          'source': randomstring.generate(),
          'ip': randomstring.generate(),
          'data': {
            'field1': randomstring.generate(),
            'field2': randomstring.generate()
          }
        });
        submissions.push(object);
        saves.push(object.save());
      }
      return Promise.all(saves);
    });

    it('GET /api/submission',(done) => {
      chai.request(api)
        .get('/api/submission')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(submissions.length);
          done();
        });
    });
  });
});
