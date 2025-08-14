#!/bin/sh

# Replace API_URL placeholder with environment variable
if [ ! -z "$API_URL" ]; then
    echo "Replacing API_URL with: $API_URL"
    find /app/dist -name "*.js" -exec sed -i "s|http://localhost:5000/api|$API_URL|g" {} \;
    find /app/dist -name "*.mjs" -exec sed -i "s|http://localhost:5000/api|$API_URL|g" {} \;
else
    echo "Using default API_URL: http://localhost:5000/api"
fi

# Start the application
exec "$@"
