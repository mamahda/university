kubectl create secret tls \
	mytls \
	--key="certs/MyPrivate.key" \
	--cert="certs/MyCert.crt" \
	--dry-run=client -o=yaml > tls-secret.yaml

