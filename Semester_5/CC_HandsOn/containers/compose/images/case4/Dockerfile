FROM nginx:1.15.12-alpine

RUN apk update && apk add php7-fpm supervisor git curl

ADD nginx.conf /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/conf.d/default.conf
ADD html/ /var/www/html/
ADD start.sh /
ADD supervisord.conf /tmp


ENTRYPOINT ["/bin/sh","/start.sh"]
