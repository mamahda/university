sudo sysctl -w fs.inotify.max_user_instances=512
sudo sysctl -w fs.inotify.max_user_watches=524288
kind create cluster --name mylab99 --config cluster-config.yaml
