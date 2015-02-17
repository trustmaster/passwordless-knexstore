[![Build Status](https://travis-ci.org/trustmaster/passwordless-knexstore.svg)](https://travis-ci.org/trustmaster/passwordless-knexstore)

passwordless-knexstore
===========================

A Passwordless TokenStore impleentation using Knex.js

Installation
------------

`npm install passwordless-knexstore`

Usage
-----

Create a Knex Table with following properties:
 * `token` string (unique)
 * `uid` string (unique)
 * `ttl` timestamp
 * `origin` string

For example, create a knex migration using this command:

```
./node_modules/.bin/knex migrate:make passwordless
```

and add schema creation to the migration:

```js
knex.schema.createTable('passwordless', function(table) {
  table.increments('id').primary();
  table.string('token').unique();
  table.string('uid').unique();
  table.timestamp('ttl');
  table.string('origin');
});
```

Initialize store, passing a knex object to it:

```js
var KnexStore = require('passwordless-knexstore');
passwordless.init(new KnexStore(knex));
```

Author
------

Forked from [passwordless-bookshelfstore](https://github.com/nnarhinen/passwordless-bookshelfstore) by Niklas Närhinen <niklas@narhinen.net>.

License
-------

The MIT license
