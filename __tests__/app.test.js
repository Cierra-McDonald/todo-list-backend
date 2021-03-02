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

    const chore = { 

      'todo': 'Feed Jaxon',
      'completed': true,
    };

    const dbChore = { 
      ...chore,
      owner_id: 2,
      id:4,
    };

    test('create a new chore', async() => { 
      const chore = { 
        'todo': 'Feed Jaxon',
        'completed': true,
      };
      const data = await fakeRequest(app)
        .post('/api/todoList')
        .send(chore)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(dbChore);  
    });

    test('get a chore for a given user', async() => { 
      const data = await fakeRequest(app)
        .get('/api/todoList')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(dbChore);
    });

    test('getting a chore from user by id', async() => { 
      const data = await fakeRequest(app)
        .get('/api/todoList/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(dbChore);  
    });

    test('updating a chore for a given user', async() => { 
      const updatedChore = { 
        todo: 'Feed Jaxon',
        completed: false
      };
      const newUpdatedChore = { 
        ...updatedChore,
        id: 4,
        owner_id: 2,
      };

      await fakeRequest(app)
        .put('/api/todoList/4')
        .send(newUpdatedChore)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const finalChoreUpdate = await fakeRequest(app)
        .get('/api/todoList/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(finalChoreUpdate.body[0]).toEqual(newUpdatedChore); 
    });

  });
});
