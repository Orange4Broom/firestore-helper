#!/bin/bash

# Script for publishing the package to npm

npm run build

npm publish

# Check if the publish was successful
if [ $? -ne 0 ]; then
    echo "Failed to publish the package"
    exit 1
fi

