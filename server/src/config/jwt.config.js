
module.exports = {  
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
    JWT_EXPIRES: process.env.JWT_EXPIRES || '24h'
  };