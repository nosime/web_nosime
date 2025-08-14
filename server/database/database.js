// server/database/database.js - PostgreSQL only for ARM64 branch
const { Pool } = require('pg');
const config = require('./config');

class Database {
    constructor() {
        this.pool = null;
        this.connectionRetries = 3;
        this.retryDelay = 1000;
    }

    async getConnection() {
        if (this.pool) {
            return this.pool;
        }

        // Thử kết nối với số lần retry
        for (let i = 0; i < this.connectionRetries; i++) {
            try {
                this.pool = new Pool(config);

                // Test connection
                const client = await this.pool.connect();
                client.release();

                console.log('PostgreSQL connected successfully by database.js');

                // Thêm error handler
                this.pool.on('error', (err) => {
                    console.error('Pool error:', err);
                    this.pool = null;
                });

                return this.pool;

            } catch (err) {
                console.error(`Connection attempt ${i + 1} failed:`, err);
                if (i === this.connectionRetries - 1) throw err;
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    async closePool() {
        try {
            if (this.pool) {
                await this.pool.end();
                this.pool = null;
            }
        } catch (err) {
            console.error('Error closing pool:', err);
        }
    }

    async query(sqlQuery, params = []) {
        try {
            const pool = await this.getConnection();
            const result = await pool.query(sqlQuery, params);
            
            // Return format compatible with mssql
            return {
                recordset: result.rows,
                rowsAffected: [result.rowCount || 0]
            };

        } catch (err) {
            console.error('Query error:', err);
            this.pool = null; // Reset pool on error
            throw err;
        }
    }

    async transaction() {
        try {
            const pool = await this.getConnection();
            const client = await pool.connect();
            
            await client.query('BEGIN');
            
            return {
                request: () => ({
                    query: async (sql, params = []) => {
                        const result = await client.query(sql, params);
                        return {
                            recordset: result.rows,
                            rowsAffected: [result.rowCount || 0]
                        };
                    }
                }),
                commit: async () => {
                    await client.query('COMMIT');
                    client.release();
                },
                rollback: async () => {
                    await client.query('ROLLBACK');
                    client.release();
                }
            };
        } catch (err) {
            console.error('Transaction error:', err);
            throw err;
        }
    }
}

// Tạo singleton instance
const database = new Database();

// Cleanup khi tắt server
process.on('SIGINT', async () => {
    await database.closePool();
    process.exit(0);
});

module.exports = database;