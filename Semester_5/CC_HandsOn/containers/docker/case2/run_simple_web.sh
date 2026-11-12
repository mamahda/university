#!/bin/sh
docker container run \
	-dit \
	--name webserver1 \
	--volume $(pwd)/files:/html \
	--publish 9999:9999 \
	python:3.13.0a1-alpine3.17 \
	python3 -m http.server 9999 -d /html

