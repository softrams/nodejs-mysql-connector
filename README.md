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