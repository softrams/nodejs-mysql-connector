/* istanbul ignore file */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-else-return */
const mysql = require("mysql");
const fs = require('fs');

let pools = {};
let config = {};

exports.init = async (cfg) => {
  config = cfg;
};

exports.createPool = async (poolName) => {
  try {
    const srcCfg = config.DATASOURCES[poolName];
    if (srcCfg) {
      const options = {
        connectionLimit: srcCfg.DB_CONNECTION_LIMIT || 5,
        host: srcCfg.DB_HOST,
        user: srcCfg.DB_USER,
        password: srcCfg.DB_PASSWORD,
        database: srcCfg.DB_DATABASE,
        port: srcCfg.PORT,
        multipleStatements: srcCfg.ALLOW_MULTI_STATEMENTS || false,
        timezone: srcCfg.TIMEZONE || 'local',
      };

      if (srcCfg.SSL) {
        const sslConfig = {
          rejectUnauthorized: srcCfg.SSL.hasOwnProperty('REJECT_UNAUTHORIZED') ? srcCfg.REJECT_UNAUTHORIZED : true,
        };

        if (srcCfg.SSL.USE_AWS_CERT) {
          sslConfig.ca = fs.readFileSync(__dirname + '/rds-combined-ca-bundle.pem');
        } else if (srcCfg.SSL.CUSTOM_CERT) {
          sslConfig.ca = srcCfg.SSL.CUSTOM_CERT;
        }

        options.ssl = sslConfig;
      }

      pools[poolName] = mysql.createPool(options);
      console.debug(`MySQL Adapter: Pool ${poolName} created`);
      return true;
    } else {
      console.error(`MySQL Adapter: Missing configuration for ${poolName}`);
      return false;
    }
  } catch (err) {
    console.error("MySQL Adapter: Error while closing connection", err);
    return false;
  }
};

exports.connect = async (poolName) => {
  try {
    if (!pools[poolName]) {
      await this.createPool(poolName);
    }
    return pools[poolName];
  } catch (err) {
    console.error("MySQL Adapter: Error while retrieving a connection", err);
    throw new Error(err.message);
  }
};

this.query = async (conn, query, params) => {
  return new Promise((resolve, reject) => {
    try {
      conn.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    } catch (err) {
      console.error("MySQL Adapter:  Failure in query: ", err);
      reject(err);
    }
  });
};

exports.execute = async (srcName, query, params = {}) => {
  try {
    console.debug(query);
    if (params) {
      console.debug(JSON.stringify(params));
    }

    const start = process.hrtime();
    const conn = await this.connect(srcName);

    console.debug(
      `MySQL Adapter: Connection secured: ${process.hrtime(start)[0]}s ${
        process.hrtime(start)[1] / 1000000
      }ms`
    );
    const results = await this.query(conn, query, params);

    console.debug(
      `MySQL Adapter: Query executed: ${process.hrtime(start)[0]}s ${
        process.hrtime(start)[1] / 1000000
      }ms`
    );

    return results;
  } catch (err) {
    console.error("MySQL Adapter: Error while executing query", err);
    throw new Error(err.message);
  }
};

exports.closeAllPools = async () => {
  try {
    for (const poolAlias of Object.keys(pools)) {
      await this.closePool(poolAlias);
      delete pools[poolAlias];
      console.debug(`MySQL Adapter: Pool ${poolAlias} closed`);
    }
    return true;
  } catch (err) {
    console.error("MySQL Adapter: Error while closing connection", err);
    return false;
  }
};

exports.closePool = async (poolAlias) => {
  try {
    if (pools[poolAlias]) {
      const poolConn = pools[poolAlias];
      delete pools[poolAlias];
      await poolConn.end((err) => {
        if (err) {
          console.error(
            `Error while closing connection pool ${poolAlias}`,
            err
          );
        }
      });
      return true;
    } else {
      return true;
    }
  } catch (err) {
    console.error("MySQL Adapter: Error while closing connection", err);
    return false;
  }
};
