#!/usr/bin/env bash

set -e

PORT="${PORT:-10000}"

if [ -z "${APP_KEY}" ]; then
    export APP_KEY="$(php artisan key:generate --show --no-ansi)"
fi

mkdir -p \
    storage/logs \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache

sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/:80/:${PORT}/" /etc/apache2/sites-available/000-default.conf

php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

apache2-foreground
