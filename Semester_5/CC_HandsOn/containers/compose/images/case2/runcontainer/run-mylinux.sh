docker rm -f mylinux

docker run \
	-dit \
	--name mylinux \
	-p 12111:5910 \
	-p 11111:11111  \
	mylinux:1.0


