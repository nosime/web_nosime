const { Pool } = require('pg');
const config = require('./config');

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.connecting = false;
        this.connectionPromise = null;
    }

    async connect() {
        if (this.pool && !this.pool.ended) {
            return this.pool;
        }

        if (this.connecting) {
            return this.connectionPromise;
        }

        try {
            this.connecting = true;
            this.connectionPromise = this.connectPostgres();
            this.pool = await this.connectionPromise;
            console.log('PostgreSQL connected successfully');
            return this.pool;

        } catch (err) {
            console.error('PostgreSQL connection error:', err);
            this.pool = null;
            throw err;
        } finally {
            this.connecting = false;
            this.connectionPromise = null;
        }
    }

    async connectPostgres() {
        const pool = new Pool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            max: config.max || 10,
            min: config.min || 0,
            idleTimeoutMillis: config.idleTimeoutMillis || 300000
        });

        pool.on('error', (err) => {
            console.error('PostgreSQL Pool Error:', err);
            this.pool = null;
        });

        // Test connection
        const client = await pool.connect();
        client.release();

        return pool;
    }

    async query(sqlQuery, params = []) {
        try {
            const pool = await this.connect();
            const client = await pool.connect();
            
            try {
                let pgQuery = sqlQuery;
                let values = params;

                // If params is an object, convert to positional parameters
                if (params && typeof params === 'object' && !Array.isArray(params)) {
                    values = [];
                    let paramIndex = 1;

                    Object.entries(params).forEach(([key, value]) => {
                        pgQuery = pgQuery.replace(new RegExp(`@${key}`, 'g'), `$${paramIndex}`);
                        values.push(value);
                        paramIndex++;
                    });
                }

                const result = await client.query(pgQuery, values);
                
                // Return in SQL Server compatible format
                return {
                    recordset: result.rows,
                    rowsAffected: [result.rowCount]
                };
            } finally {
                client.release();
            }

        } catch (err) {
            console.error('Query error:', err);
            this.pool = null;
            throw err;
        }
    }

    async close() {
        if (this.pool) {
            try {
                await this.pool.end();
            } catch (err) {
                console.error('Error closing pool:', err);
            }
            this.pool = null;
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