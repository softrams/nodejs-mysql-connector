# MySQL DB Connector

Wrapper utility to easily manage multiple data sources and pooled connections.

## SSL Settings

This connector allows setting SSL connection using a few different options.

You may tell the connector to use standard AWS certificates by specifying a SSL connection object such as:
```
SSL: {
  USE_AWS_CERT: true
}
```
And the connector will automatically use the AWS approved certificates for TLS encryption of traffic on connection.

You can optionally provide a custom cert:

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