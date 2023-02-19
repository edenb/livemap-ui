#!/bin/sh

ROOT_DIR=/usr/share/nginx/html

echo "Replacing env constants in JS"
for file in $ROOT_DIR/assets/*.js*;
do

  sed -i 's|VITE_SERVER_URL|'${VITE_SERVER_URL}'|g' $file
  sed -i 's|VITE_API_PATH|'${VITE_API_PATH}'|g' $file

done

echo "Starting Nginx"
nginx -g 'daemon off;'
