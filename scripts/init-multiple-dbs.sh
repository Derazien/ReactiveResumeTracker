#!/bin/bash
set -e

# This script creates multiple databases for the project
# reactive_resume - for your main application
# skyvern - for Skyvern automation engine

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE skyvern;
    GRANT ALL PRIVILEGES ON DATABASE skyvern TO $POSTGRES_USER;
EOSQL

echo "✅ Multiple databases created successfully!"
echo "📊 reactive_resume - Main application database"  
echo "🤖 skyvern - Automation engine database"

