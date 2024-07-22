const sql = require('msnodesqlv8');
const { promisify } = require('util');
const DatabaseAdapter = require('./DatabaseAdapter');

class SQLServerAdapter extends DatabaseAdapter {
    constructor(connectionString) {
        super();
        this.connectionString = connectionString;
        this.conn = null;
    }

    async connect() {
        try {
            this.conn = await new Promise((resolve, reject) => {
                sql.open(this.connectionString, (err, conn) => {
                    if (err) {
                        reject(new Error('Error connecting to open the database: ' + err.message));
                        return;
                    }
                    resolve(conn);
                });
            });
            console.log('Connected to the database successfully');
        } catch (error) {
            console.error('Error connecting to the database:', error.message);
        }
    }

    async query(sqlQuery, params = []) {
        if (!this.conn) {
            throw new Error('Not connected to the database.');
        }
        const queryAsync = promisify(this.conn.query).bind(this.conn);
        try {
            const results = await queryAsync(sqlQuery, params);
            return results;
        } catch (err) {
            console.error('SQL Server query error:', err.message);
            throw err;
        }
    }

    async disconnect() {
        if (this.conn) {
            this.conn.close((closeErr) => {
                if (closeErr) {
                    console.error('Error disconnecting from the database:', closeErr.message);
                    return;
                }
                console.log('Disconnected from the database');
            });
        }
    }
}

const createSQLServerAdapterSingleton = (function () {
    let instance;
    return function (connectionString) {
        if (!instance) {
            instance = new SQLServerAdapter(connectionString);
        }
        return instance;
    };
})();

module.exports = createSQLServerAdapterSingleton;
