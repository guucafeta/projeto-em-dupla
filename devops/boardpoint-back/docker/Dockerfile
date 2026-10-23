FROM php:8.2-apache

# pdo_mysql: banco; mbstring: validações. A imagem já fornece fileinfo para os uploads.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring \
    && apt-get clean

COPY uploads.ini /usr/local/etc/php/conf.d/uploads.ini

RUN mkdir -p /var/www/html/produtos/uploads \
    && chown -R www-data:www-data /var/www/html/produtos

EXPOSE 80
