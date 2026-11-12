FROM alpine:3.9

RUN apk update && apk add --no-cache apache2 curl supervisor socat php7-intl php7-openssl php7-pecl-redis php7-sqlite3 php7-pdo_mysql php7-mbstring apache2-ssl php7-apache2 php7-intl php7-openssl php7-sqlite3 php7-pdo_mysql php7-mbstring apache2-ssl php7-apache2 apache2 apache2-ctl php7-pecl-ssh2 php7-bcmath php7-curl php7-json php7-pecl-couchbase php7-zip php7-mysqli mysql-client php7-pecl-mcrypt php7-pecl-redis supervisor
RUN apk add composer php7-gmp php7-sodium  php7-xml supervisor
RUN rm -rf /tmp/* /var/cache/apk/*

ADD start.sh /tmp
ADD supervisord.conf /tmp/supervisord.conf

EXPOSE 80
EXPOSE 9999

ENV SESSIONAGE 60
ENV REAUTHENTICATION 60
ENV IPEXPIRE 120
VOLUME ["/var/www/localhost/htdocs"]

ENTRYPOINT ["sh","-C","/tmp/start.sh"]
