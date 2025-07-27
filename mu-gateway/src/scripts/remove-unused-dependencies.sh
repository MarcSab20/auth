#!/bin/bash

# Run depcheck and store the output in a variable
UNUSED_DEPS=$(npx depcheck --json | jq -r '.dependencies | .[]')

# Check if there are unused dependencies
if [ -z "$UNUSED_DEPS" ]; then
  echo "No unused dependencies found."
  exit 0
fi

# Loop through each unused dependency and uninstall it
for dep in $UNUSED_DEPS; do
  echo "Removing unused dependency: $dep"
  npm uninstall "$dep"
done

echo "Unused dependencies have been removed."
