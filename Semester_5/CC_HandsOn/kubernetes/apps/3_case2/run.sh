kubectl apply \
	-f docker-secret.yaml \
	-f tls-secret.yaml \
	-f foo.yaml \
	-f bar.yaml \
	-f coba.yaml \
        -f coba2.yaml \
	-f ingress.yaml

