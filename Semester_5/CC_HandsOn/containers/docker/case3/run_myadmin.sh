#!/bin/sh

docker rm -f phpmyadmin1

docker container run \
	-dit \
	--name phpmyadmin1 \
	-p 10000:80 \
	-e PMA_HOST=mysql1 \
	-e MYSQL_ROOT_PASSWORD=mydb6789tyui \
	--link mysql1 \
        phpmyadmin:5.2.1-apache
