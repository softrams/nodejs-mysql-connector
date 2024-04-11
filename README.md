# MySQL DB Connector

Wrapper utility to easily manage multiple data sources and pooled connections.

## Error Returns

By default, all errors occurring during a query are returned. If you want to be extra-safe in a production environment, you can set `HIDE_DB_ERRORS` value on the root `config` passed to the connector on initialization. When you do this, all errors will be logged, but none returned when a query error occurs.

## SSL Settings

This connector allows setting SSL connection using a few different options.

You can provide a custom cert:

```
SSL: {
  CUSTOM_CERT: // custom cert string
}
```

By default, when specifying an SSL object, the mysql connector will reject unauthorized calls by adding `rejectUnauthorized: true`. You may override this setting by specifying a value for `REJECT_UNAUTHORIZED` in your `SSL` config:

```
SSL: {
  REJECT_UNAUTHORIZED: false // not recommended
}
```

## Data Typing Options

This connector gives you a few options for configuring how data is returned from the connector. 'typeCast' defaults to true, and converts
data from the database to its javascript equivalent. For example, it will convert DATETIME SQL objects to a DATE javascript type.
You can also set 'dateStrings' which defaults to false. If you set it to true it will override typeCast and force date returns to be a string instead of a DATE type.

## Working within a transaction
As of version 0.1.0 you can utilize sql transactions. Simply call the transactionConnection method to get a transaction connection and then begin the transaction.
Then, write as many queries as you want, and when you are done, you can commit the transaction and all of your queries will be saved to the database or you can roll back the transaction and nothing done while inside that transaction will be saved. Some pseudo-code for how you might do that is below:
```
someMethod = async () => {
    const pool = await dataSource.connect(DATABASE_POOL);
    const transactionConnection = await dataSource.transactionConnection(pool);
    await transactionConnection.beginTransaction();

    try {
      await transactionConnection.execute(SOME_QUERY, []);
      await transactionConnection.execute(SOME_QUERY, []);
      await transactionConnection.execute(SOME_QUERY, []);

      await transactionConnection.commitTransaction();
    } catch (err) {
      await transactionConnection.rollbackTransaction();
      throw err;
    }
  };
```
