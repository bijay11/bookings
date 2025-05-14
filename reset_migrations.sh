#!/bin/bash

echo "Rolling back all applied migrations..."

# Loop through the migrations
while true; do
  # Get the status of migrations
  status=$(soda migrate status)

  # Check if there are any applied migrations
  if echo "$status" | grep -q 'Applied'; then
    # Run the down migration but ignore errors if the table doesn't exist
    soda migrate down || true
  else
    echo "No more migrations to roll back."
    break
  fi
done

echo "All migrations rolled back (skipped any errors)."
