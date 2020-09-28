/* istanbul ignore file */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-else-return */
const mysql = require("mysql");

let pools = {};
let config = {};

exports.init = async (cfg) => {
  config = cfg;
};

exports.createPool = async (poolName, allowMultiStatements = false) => {
  try {
    const srcCfg = config.DATASOURCES[poolName];
    if (srcCfg) {
      pools[poolName] = mysql.createPool({
        connectionLimit: 5,
        host: srcCfg.DB_HOST,
        user: srcCfg.DB_USER,
        password: srcCfg.DB_PASSWORD,
        database: srcCfg.DB_DATABASE,
        port: srcCfg.PORT,
        multipleStatements: allowMultiStatements,
      });
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

exports.connect = async (poolName, allowMultiStatements) => {
  try {
    if (!pools[poolName]) {
      await this.createPool(poolName, allowMultiStatements);
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
    const tempPools = pools;
    pools = {};
    for (const poolAlias of Object.keys(tempPools)) {
      await this.closePool(poolAlias);
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
      poolConn.end((err) => {
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
