const oracledb = require('oracledb');

(async () => {
    await oracledb.createPool({
        user: process.env.NODE_ORACLEDB_USER,
        password: process.env.NODE_ORACLEDB_PASSWORD,
        connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
    });
})();
module.exports = oracledb;