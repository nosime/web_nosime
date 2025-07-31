// server/src/database/database.js
const sql = require('mssql');
const config = require('./config');

class Database {
    constructor() {
        this.pool = null;
        this.connectionRetries = 3;
        this.retryDelay = 1000;
    }

    async getConnection() {
        if (this.pool?.connected) {
            return this.pool;
        }

        // Đóng pool cũ nếu có
        if (this.pool) {
            await this.closePool();
        }

        // Thử kết nối với số lần retry
        for (let i = 0; i < this.connectionRetries; i++) {
            try {
                this.pool = await new sql.ConnectionPool({
                    ...config,
                    options: {
                        ...config.options,
                        enableArithAbort: true,
                        trustServerCertificate: true,
                        encrypt: false,
                        connectionTimeout: 30000,
                    },
                    pool: {
                        min: 0,
                        max: 10,
                        idleTimeoutMillis: 300000,
                        acquireTimeoutMillis: 30000,
                        createRetryIntervalMillis: 2000,
                    }
                }).connect();

                console.log('Database connected successfully');

                // Thêm error handler
                this.pool.on('error', err => {
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
            await this.pool?.close();
            this.pool = null;
        } catch (err) {
            console.error('Error closing pool:', err);
        }
    }

    async query(sqlQuery, params = {}) {
        try {
            const conn = await this.getConnection();
            const request = new sql.Request(conn);

            // Add parameters if any
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, value);
            });

            const result = await request.query(sqlQuery);
            return result;

        } catch (err) {
            console.error('Query error:', err);
            this.pool = null; // Reset pool on error
            throw err;
        }
    }
    async transaction() {
        try {
            const pool = await this.getConnection();
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            return transaction;
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