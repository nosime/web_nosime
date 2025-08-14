const sql = require('mssql');
const { Pool } = require('pg');
const config = require('./config');

class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.connecting = false;
        this.connectionPromise = null;
        this.dbType = config.dbType || 'mssql';
    }

    async connect() {
        if (this.connection?.connected || (this.dbType === 'postgres' && this.connection)) {
            return this.connection;
        }

        if (this.connecting) {
            return this.connectionPromise;
        }

        try {
            this.connecting = true;
            
            if (this.dbType === 'postgres') {
                this.connectionPromise = this.connectPostgres();
            } else {
                this.connectionPromise = this.connectMssql();
            }
            
            this.connection = await this.connectionPromise;
            console.log(`Database (${this.dbType}) connected successfully`);
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

    async connectMssql() {
        const mssqlConfig = {
            server: config.server,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            options: config.options
        };

        const connection = await sql.connect(mssqlConfig);
        
        connection.on('error', err => {
            console.error('SQL Connection Error:', err);
            this.connection = null;
        });

        return connection;
    }

    async connectPostgres() {
        const pool = new Pool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            max: config.max,
            min: config.min,
            idleTimeoutMillis: config.idleTimeoutMillis
        });

        pool.on('error', (err) => {
            console.error('PostgreSQL Connection Error:', err);
            this.connection = null;
        });

        // Test connection
        const client = await pool.connect();
        client.release();

        return pool;
    }

    async query(sqlQuery, params = {}) {
        try {
            const conn = await this.connect();

            if (this.dbType === 'postgres') {
                return await this.queryPostgres(conn, sqlQuery, params);
            } else {
                return await this.queryMssql(conn, sqlQuery, params);
            }

        } catch (err) {
            console.error('Query error:', err);
            this.connection = null;
            throw err;
        }
    }

    async queryMssql(conn, sqlQuery, params) {
        const request = new sql.Request(conn);

        // Add parameters if any
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.query(sqlQuery);
        return result;
    }

    async queryPostgres(pool, sqlQuery, params) {
        const client = await pool.connect();
        try {
            // Convert named parameters to positional parameters for PostgreSQL
            let pgQuery = sqlQuery;
            const values = [];
            let paramIndex = 1;

            Object.entries(params).forEach(([key, value]) => {
                pgQuery = pgQuery.replace(new RegExp(`@${key}`, 'g'), `$${paramIndex}`);
                values.push(value);
                paramIndex++;
            });

            const result = await client.query(pgQuery, values);
            return {
                recordset: result.rows,
                rowsAffected: [result.rowCount]
            };
        } finally {
            client.release();
        }
    }

    async close() {
        if (this.connection) {
            try {
                if (this.dbType === 'postgres') {
                    await this.connection.end();
                } else {
                    await this.connection.close();
                }
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