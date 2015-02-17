var util = require('util'),
    TokenStore = require('passwordless-tokenstore'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt'));

function KnexStore(Knex, options) {
  TokenStore.call(this);
  this._Knex = Knex;
  this._options = options || {};
  this._options.table = this._options.table || 'passwordless';
};

util.inherits(KnexStore, TokenStore);

KnexStore.prototype.authenticate = function(token, uid, callback) {
  if(!token || !uid || !callback) {
    throw new Error('TokenStore:authenticate called with invalid parameters');
  }
  var Knex = this._Knex, table = this._options.table;
  Knex(table).select()
    .where('uid', uid)
    .andWhere('ttl', '>', new Date())
  .then(function(rows) {
    if (!rows || rows.length !== 1) return null;
    return bcrypt.compareAsync(token, rows[0].token).then(function(matches) {
      if (!matches) return null;
      return rows[0];
    });
  }).then(function(row) {
    if (!row) return callback(null, false, null);
    callback(null, true, row.origin);
  }).catch(callback);
};

KnexStore.prototype.storeOrUpdate = function(token, uid, msToLive, originUrl, callback) {
  if(!token || !uid || !msToLive || !callback) {
    throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
  }
  var Knex = this._Knex, table = this._options.table;
  Knex(table).select()
    .where('uid', uid)
  .then(function(rows) {
    return bcrypt.hashAsync(token, 10).then(function(hash) {
      var data = {
        token: hash,
        uid: uid,
        ttl: new Date(Date.now() + msToLive),
        origin: originUrl
      };
      if (!rows || rows.length !== 1) {
        return Knex(table).insert(data);
      } else {
        return Knex(table).update(data).where('uid', uid);
      }
    });
  })
  .then(function() {
    callback();
  })
  .catch(callback);
};

KnexStore.prototype.invalidateUser = function(uid, callback) {
  if(!uid || !callback) {
    throw new Error('TokenStore:invalidateUser called with invalid parameters');
  }
  this._Knex(this._options.table)
    .delete()
    .where('uid', uid)
  .then(function(count) {
    callback();
  }).catch(callback);
};

KnexStore.prototype.length = function(callback) {
  this._Knex(this._options.table)
    .count()
  .then(function(rows) {
    callback(null, Number(rows[0]['count(*)']));
  }).catch(callback);
};

KnexStore.prototype.clear = function(callback) {
  if (!callback) throw new Error('TokenStore:clear is missing callback');
  this._Knex(this._options.table)
    .del()
  .then(function(count) {
    callback();
  }).catch(callback);
};


module.exports = KnexStore;
