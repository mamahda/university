
kind export kubeconfig --name mylab99 --kubeconfig ./kubeconfig.cluster.yaml
cp ./kubeconfig.cluster.yaml kubeconfig
export KUBECONFIG=$(pwd)/kubeconfig
kubectl get nodes

