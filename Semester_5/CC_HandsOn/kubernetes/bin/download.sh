#curl -LO https://github.com/k0sproject/k0sctl/releases/download/v0.16.0/k0sctl-linux-x64
#curl -Lo ./rke  https://github.com/rancher/rke/releases/download/v1.4.10/rke_linux-amd64
#chmod a+x ./rke
#https://github.com/kubernetes-sigs/kind/releases/download/v0.33.0/kind-linux-amd64

curl -Lo ./kind  https://github.com/kubernetes-sigs/kind/releases/download/v0.33.0/kind-linux-amd64
chmod a+x ./kind

curl -Lo ./kubectl  "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod a+x ./kubectl


curl -Lo ./helm.tar.gz "https://get.helm.sh/helm-v4.3.0-linux-amd64.tar.gz"
tar -xzvf helm.tar.gz
mv linux-amd64/helm .
rm -rf linux-amd64
rm -f helm.tar.gz
chmod +x ./helm
curl -Lo ./linkerd https://github.com/linkerd/linkerd2/releases/download/edge-26.9.3/linkerd2-cli-edge-26.9.3-linux-amd64
chmod +x ./linkerd

curl -Lo ./k0s https://github.com/k0sproject/k0s/releases/download/v1.36.4%2Bk0s.1/k0s-v1.36.4+k0s.1-amd64
chmod +x ./k0s

export PATH=$PATH:$(pwd)



