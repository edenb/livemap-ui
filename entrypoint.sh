#!/bin/sh
for file in /usr/share/nginx/html/js/app.*.js;
do
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi
  envsubst '$VITE_SERVER_URL,$VITE_API_PATH' < $file.tmpl.js > $file
done
echo "Starting Nginx"
nginx -g 'daemon off;'
