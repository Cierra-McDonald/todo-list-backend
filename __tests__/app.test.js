require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns a singleperson\'s to-do list', async() => {

      const expectation = [
        {
          'id': 1,
          'todo': 'Complete a 10 minute meditation.',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 2,
          'todo': 'Do the dishes.',
          'completed': false,
          'owner_id': 1
        },
        {
          'id': 3,
          'todo': 'Do code challenges.',
          'completed': false,
          'owner_id': 1
        }
        
      ];

      const data = await fakeRequest(app)
        .get('/todoList')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
