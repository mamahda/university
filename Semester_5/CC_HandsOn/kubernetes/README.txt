persiapan
- cd bin
- sh download.sh untuk mendownload semua tools yang dibutuhkan
- source set.sh untuk mengeset PATH


menginstall cluster
- cd setup-cluster/kind
- edit cluster-config.yaml
- jalankan script 1-create-cluster.sh untuk membuat cluster
- jalankan script 2-set-config.sh untuk mendapatkan kubeconfig 
- jalankan script 3-install-ingress.sh untuk memasang ingress (traffic controller dan reverse proxy)
- jalankan script 4-cek-ingress.sh untuk melakukan checking pada setup ingress sebelumnya (butuh menunggu)



menginstall visualizer dengan octant
- cd apps/1_visualizer
- sh download.sh untuk mendownload octant
- sh run.sh untuk menjalankan octant
- cek dengan browser pada port <ip>:22222
