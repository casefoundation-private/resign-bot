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
  let token = null;
  let submissions = null;
  const password = randomstring.generate();
  const Submission = require('./lib/models/submission');
  const User = require('./lib/models/user');
  const Review = require('./lib/models/review');
  const Notification = require('./lib/models/notification');

  before(() => {
    return database.init()
      .then(() => web.init())
      .then((_api) => {
        api = _api;
      })
  });

  beforeEach(() => {
    return database.knex('reviews').delete()
      .then(() => {
        return database.knex('submissions').delete();
      })
      .then(() => {
        return database.knex('users').delete();
      })
      .then(() => {
        return database.knex('notifications').delete();
      })
      .then(() => {
        user = new User({
          'email': randomstring.generate(),
          'role': 'admin'
        });
        user.setPassword(password)
        return user.save();
      })
      .then(() => {
        submissions = [];
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
      })
      .then(() => {
        return new Promise((resolve,reject) => {
          chai.request(api)
            .post('/api/user/login')
            .send({
              'email': user.get('email'),
              'password': password
            })
            .end((err,res) => {
              if (err || res.body.error) {
                reject(err || new Error(res.body.error));
              } else {
                token = res.body.token;
                resolve();
              }
            })
        })
      })
  });

  describe('User',() => {
    it('GET /api/user/:user',(done) => {
      chai.request(api)
        .get('/api/user/' + user.get('id'))
        .set('Authorization','JWT ' + token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.eql(user.get('id'));
          res.body.email.should.be.eql(user.get('email'));
          res.body.role.should.be.eql(user.get('role'));
          res.body.password.should.be.eql(user.get('password'));
          done();
        });
    });

    it('POST /api/user/:user',(done) => {
      const newPass = randomstring.generate();
      chai.request(api)
        .post('/api/user/' + user.get('id'))
        .set('Authorization','JWT ' + token)
        .send({
          'password': newPass
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.eql(user.get('id'));
          res.body.email.should.be.eql(user.get('email'));
          res.body.role.should.be.eql(user.get('role'));
          res.body.password.should.be.not.eql(user.get('password'));
          done();
        });
    });

    it('POST /api/user/reset',(done) => {
      chai.request(api)
        .post('/api/user/reset')
        .set('Authorization','JWT ' + token)
        .send({
          'email': user.get('email')
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.be.a('string');

          user.fetch()
            .then((user) => {
              assert(user.get('resetCode'));
              assert(user.get('resetExpiration'));
            })
            .then(() => {
              return Notification.forge().fetchAll();
            })
            .then((notifications) => {
              assert.equal(notifications.length,11);
            })
            .then(() => {
              done();
            })
            .catch((err) => done(err));
        });
    });

    it('GET /api/user/reset/:code (Accept)',(done) => {
      user.set('resetCode',randomstring.generate());
      user.set('resetExpiration',new Date(new Date().getTime() + 1000000000));
      user.save().then(() => {
        chai.request(api)
          .get('/api/user/reset/' + user.get('resetCode'))
          .set('Authorization','JWT ' + token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.message.should.be.eq('ok');
            res.body.token.should.be.a('string');
            done();
          });
      }).catch((err) => done(err));
    });

    it('GET /api/user/reset/:code (Reject)',(done) => {
      user.set('resetCode',randomstring.generate());
      user.set('resetExpiration',new Date(new Date().getTime() - 1000000000));
      user.save().then(() => {
        chai.request(api)
          .get('/api/user/reset/' + user.get('resetCode'))
          .set('Authorization','JWT ' + token)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.a('object');
            done();
          });
      }).catch((err) => done(err));
    });
  });

  describe('Submission',() => {

    it('GET /api/submission',(done) => {
      chai.request(api)
        .get('/api/submission')
        .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
        .send(newSubmission)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.id.should.be.a('number');
          res.body.source.should.be.eq('api');
          res.body.ip.should.be.eq('::ffff:127.0.0.1');
          res.body.data.field1.should.be.eq(newSubmission.data.field1);
          res.body.data.field2.should.be.eq(newSubmission.data.field2);

          Review.forSubmission(res.body.id)
            .then((reviews) => {
              assert(reviews);
              assert.equal(reviews.length,1);
            })
            .then(() => {
              return Notification.forge().fetchAll();
            })
            .then((notifications) => {
              assert.equal(notifications.length,11);
            })
            .then(() => {
              done();
            })
            .catch((err) => done(err));
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
        .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
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
          .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
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
        .set('Authorization','JWT ' + token)
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
