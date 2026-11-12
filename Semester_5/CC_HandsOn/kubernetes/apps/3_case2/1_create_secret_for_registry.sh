kubectl create secret docker-registry \
	mysecret \
	--docker-username=royyana \
       	--docker-password=XXXXXdckr_pat_UU8I4_8G_A39PqBQmTdCRkdZWEQ \
	--docker-server=docker.io/royyana \
	--dry-run=client -o yaml > docker-secret.yaml



