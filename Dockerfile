FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring xml

# Install Node.js 20 (official NodeSource repo)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Yarn
RUN npm install -g yarn

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install JS dependencies and build assets
RUN yarn install && yarn build

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 8000

CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}