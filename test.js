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
  let user = null;
  let review = null;
  const Submission = require('./lib/models/submission');
  const User = require('./lib/models/user');
  const Review = require('./lib/models/review');
  const submissions = [];

  before(() => {
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
      })
      .then(() => {
        user = new User({
          'email': randomstring.generate(),
          'password': randomstring.generate()
        });
        return user.save();
      })
      .then(() => {
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
        }
        const nextSave = (pointer) => {
          if (pointer < submissions.length) {
            return submissions[pointer].save().then(() => {
              return nextSave(pointer+1);
            });
          }
        }
        return nextSave(0);
      })
      .then(() => {
        return Submission.byId(submissions[0].get('id'));
      })
      .then((submission) => {
        review = submission.related('reviews').at(0);
        review.set('score',10);
        return review.save();
      });
  });

  describe('User',() => {
    it('GET /api/user/:user',(done) => {
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
    });

    it('POST /api/user/:user',(done) => {
      const newPass = randomstring.generate();
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
    });
  });

  describe('Submission',() => {

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

    it('GET /api/submission?reviewed=false',(done) => {
      chai.request(api)
        .get('/api/submission?reviewed=false')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(submissions.length - 1);
          done();
        });
    });

    it('GET /api/submission?reviewed=true',(done) => {
      chai.request(api)
        .get('/api/submission?reviewed=true')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });

    it('GET /api/submission/:submission',(done) => {
      chai.request(api)
        .get('/api/submission/' + submissions[0].get('id'))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.eq(submissions[0].get('id'));
          res.body.source.should.be.eq(submissions[0].get('source'));
          res.body.ip.should.be.eq(submissions[0].get('ip'));
          res.body.data.field1.should.be.eq(submissions[0].get('data').field1);
          res.body.data.field2.should.be.eq(submissions[0].get('data').field2);
          done();
        });
    });

    it('GET /api/submission/:submission/reviews',(done) => {
      chai.request(api)
        .get('/api/submission/' + submissions[0].get('id') + '/reviews')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eq(1);
          done();
        });
    });

    it('PUT /api/submission',(done) => {
      const newSubmission = {
        'data': {
          'field1': randomstring.generate(),
          'field2': randomstring.generate()
        }
      }
      chai.request(api)
        .put('/api/submission')
        .send(newSubmission)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.a('number');
          res.body.source.should.be.eq('api');
          res.body.ip.should.be.eq('::ffff:127.0.0.1');
          res.body.data.field1.should.be.eq(newSubmission.data.field1);
          res.body.data.field2.should.be.eq(newSubmission.data.field2);
          done();
        });
    });

    it('POST /api/submission/:submission',(done) => {
      const updatedSubmission = {
        'data': {
          'field1': randomstring.generate(),
          'field2': randomstring.generate()
        }
      }
      chai.request(api)
        .post('/api/submission/' + submissions[0].get('id'))
        .send(updatedSubmission)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.eq(submissions[0].get('id'));
          res.body.source.should.be.eq(submissions[0].get('source'));
          res.body.ip.should.be.eq(submissions[0].get('ip'));
          res.body.data.field1.should.be.eq(updatedSubmission.data.field1);
          res.body.data.field2.should.be.eq(updatedSubmission.data.field2);
          done();
        });
    });
  });

  describe('Review',() => {
    it('GET /api/review/:review',(done) => {
      chai.request(api)
        .get('/api/review/' + review.get('id'))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.eql(review.get('id'));
          res.body.user_id.should.be.eql(review.get('user_id'));
          res.body.submission_id.should.be.eql(review.get('submission_id'));
          res.body.score.should.be.eql(review.get('score'));
          res.body.user.should.be.a('object');
          res.body.user.id.should.be.eq(user.get('id'));
          res.body.submission.should.be.a('object');
          res.body.submission.id.should.be.eq(submissions[0].get('id'));
          done();
        });
    });

    it('PUT /api/review (Accept)',(done) => {
      const user2 = new User({
        'email': randomstring.generate(),
        'password': randomstring.generate()
      });
      user2.save().then(() => {
        const newReview = {
          'submission_id': submissions[0].get('id'),
          'user_id': user2.get('id'),
          'score': 15,
          'data': {
            'subfield1': randomstring.generate()
          }
        }
        chai.request(api)
          .put('/api/review')
          .send(newReview)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.id.should.be.a('number');
            res.body.user_id.should.be.eql(newReview.user_id);
            res.body.submission_id.should.be.eql(newReview.submission_id);
            res.body.score.should.be.eql(newReview.score);
            res.body.data.should.be.a('object');
            res.body.data.subfield1.should.be.eq(newReview.data.subfield1);
            res.body.user.should.be.a('object');
            res.body.user.id.should.be.eq(user2.get('id'));
            res.body.submission.should.be.a('object');
            res.body.submission.id.should.be.eq(submissions[0].get('id'));
            done();
          });
      });
    });

    it('PUT /api/review (Reject)',(done) => {
      const newReview = {
        'submission_id': submissions[0].get('id'),
        'user_id': user.get('id'),
        'score': 15,
        'data': {
          'subfield1': randomstring.generate()
        }
      }
      chai.request(api)
        .put('/api/review')
        .send(newReview)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.message.should.be.a('string');
          done();
        });
    });

    it('POST /api/review/:review',(done) => {
      const updatedReview = {
        'score': 30,
        'data': {
          'subfield1': randomstring.generate()
        }
      }
      chai.request(api)
        .post('/api/review/' + review.get('id'))
        .send(updatedReview)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.eql(review.get('id'));
          res.body.user_id.should.be.eql(review.get('user_id'));
          res.body.submission_id.should.be.eql(review.get('submission_id'));
          res.body.score.should.be.eql(updatedReview.score);
          res.body.user.should.be.a('object');
          res.body.user.id.should.be.eq(user.get('id'));
          res.body.submission.should.be.a('object');
          res.body.submission.id.should.be.eq(submissions[0].get('id'));
          res.body.data.should.be.a('object');
          res.body.data.subfield1.should.be.eq(updatedReview.data.subfield1);
          done();
        });
    });
  });
});
