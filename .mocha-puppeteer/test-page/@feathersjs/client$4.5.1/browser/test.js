$_mod.def("/@feathersjs/client$4.5.1/browser/test", function(require, exports, module, __filename, __dirname) { const assert = require('/assert$1.5.0/assert'/*'assert'*/);
const baseTests = require('/@feathersjs/tests$4.5.1/lib/client'/*'@feathersjs/tests/lib/client'*/);
const memory = require('/feathers-memory$4.1.0/lib/index'/*'feathers-memory'*/);

const feathers = require('/@feathersjs/client$4.5.1/dist/feathers'/*'../dist/feathers'*/);

// Create an in-memory CRUD service for our Todos
class TodoService extends memory.Service {
  get (id, params) {
    if (params.query.error) {
      return Promise.reject(new Error('Something went wrong'));
    }

    return super.get(id).then(data =>
      Object.assign({ query: params.query }, data)
    );
  }
}

describe('Feathers client browser smoke tests', function () {
  const app = feathers()
    .use('/myservice', {
      get (id) {
        return Promise.resolve({
          id, description: `You have to do ${id}!`
        });
      },

      create (data) {
        return Promise.resolve(data);
      }
    })
    .use('/todos', new TodoService({
      multi: true
    }));

  app.service('myservice').hooks({
    before: {
      create (hook) {
        hook.data.hook = true;
      }
    },
    after: {
      get (hook) {
        hook.result.ran = true;
      }
    }
  });

  before(() => app.service('todos').create({
    text: 'some todo',
    complete: false
  }));

  after(() => app.service('todos').remove(null));

  baseTests(app, 'todos');

  describe('Client side hooks and services', () => {
    it('initialized myservice and works with hooks', done => {
      app.service('myservice').get('dishes').then(todo => {
        assert.deepEqual(todo, {
          id: 'dishes',
          description: 'You have to do dishes!',
          ran: true
        });
        done();
      }).catch(done);
    });

    it('create and event with hook', done => {
      const myservice = app.service('myservice');

      myservice.once('created', data => {
        assert.deepEqual(data, {
          description: 'Test todo',
          hook: true
        });
        done();
      });

      myservice.create({ description: 'Test todo' });
    });

    describe('Feathers Errors', () => {
      describe('successful error creation', () => {
        describe('without custom message', () => {
          it('default error', () => {
            const error = new feathers.errors.GeneralError();
            assert.equal(error.code, 500);
            assert.equal(error.message, 'Error');
            assert.equal(error.className, 'general-error');
            assert.equal(error instanceof feathers.errors.GeneralError, true);
            assert.equal(error instanceof feathers.errors.FeathersError, true);
          });
        });
      });
    });
  });
});

});