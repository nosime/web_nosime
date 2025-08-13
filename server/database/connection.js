const sql = require('mssql');

const config = {
    server: 'localhost',
    port: 14330,
    user: 'sa',
    password: 'Nosime44@', 
    database: 'MovieDB',
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
        encrypt: false,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
};

class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.connecting = false;
        this.connectionPromise = null;
    }

    async connect() {
        if (this.connection?.connected) {
            return this.connection;
        }

        if (this.connecting) {
            return this.connectionPromise;
        }

        try {
            this.connecting = true;
            this.connectionPromise = sql.connect(config);
            this.connection = await this.connectionPromise;

            this.connection.on('error', err => {
                console.error('SQL Connection Error:', err);
                this.connection = null;
            });

            console.log('Database connected successfully by connection.js');
            return this.connection;

        } catch (err) {
            console.error('Connection error:', err);
            this.connection = null;
            throw err;
        } finally {
            this.connecting = false;
            this.connectionPromise = null;
        }
    }

    async query(sqlQuery, params = {}) {
        try {
            const conn = await this.connect();
            const request = new sql.Request(conn);

            // Add parameters if any
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });

            const result = await request.query(sqlQuery);
            return result;

        } catch (err) {
            console.error('Query error:', err);
            // Try to reconnect on next query
            this.connection = null;
            throw err;
        }
    }

    async close() {
        if (this.connection) {
            try {
                await this.connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
            this.connection = null;
        }
    }
}

const db = new DatabaseConnection();

// Cleanup
process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});

module.exports = db;