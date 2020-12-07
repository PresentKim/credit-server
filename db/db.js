const oracledb = require('oracledb');
const config = require('../config.json');

(async () => {
    await oracledb.createPool({
        user: config.NODE_ORACLEDB_USER,
        password: config.NODE_ORACLEDB_PASSWORD,
        connectString: config.NODE_ORACLEDB_CONNECTION_STRING,
    });
})();
module.exports = oracledb;