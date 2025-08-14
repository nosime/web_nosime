#!/bin/sh

echo "Starting server with database migration..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migration
echo "Running database migration..."
npm run migrate

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
    # Start the server
    echo "Starting the application server..."
    npm start
else
    echo "Migration failed!"
    exit 1
fi
