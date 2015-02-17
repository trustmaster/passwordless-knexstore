var TokenStore = require('../'),
    fs = require('fs'),
    dbFile = __dirname + '/test.db',
    Token;


var standardTests = require('passwordless-tokenstore-test');

function TokenStoreFactory() {
  return new TokenStore(Token);
}

var beforeEachTest = function(done) {
  var knex = require('knex')({
      client: 'sqlite3',
      connection: {
        filename: dbFile
      }
  });

  Token = knex;

  knex.schema.createTable('passwordless', function(table) {
    table.increments('id').primary();
    table.string('token').unique();
    table.string('uid').unique();
    table.timestamp('ttl');
    table.string('origin');
  }).then(function() { done(); }).catch(done);
}

var afterEachTest = function(done) {
  fs.unlink(dbFile, done);
}

// Call the test suite
standardTests(TokenStoreFactory, beforeEachTest, afterEachTest);
