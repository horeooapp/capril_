#!/bin/bash
# Scripts to fix invalid JSONB defaults in Prisma migrations for PostgreSQL
echo "Running fix-migrations.sh..."
find prisma/migrations -name "migration.sql" | while read -r filename; do
    echo "Processing $filename"
    # Match JSONB DEFAULT {} and replace with '{}'::jsonb
    sed -i "s/JSONB DEFAULT {}/JSONB DEFAULT '{}'::jsonb/g" "$filename"
    sed -i "s/JSONB DEFAULT \\[\\]/JSONB DEFAULT '[]'::jsonb/g" "$filename"
done
echo "Fix complete."
