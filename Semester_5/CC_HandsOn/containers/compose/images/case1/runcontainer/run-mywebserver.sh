docker rm -f mywebserver

docker run \
	-dit \
	--name mywebserver \
	-p 9999:80 \
	-v $(pwd)/html:/var/www/localhost/htdocs/ \
	mywebserver:1.0


