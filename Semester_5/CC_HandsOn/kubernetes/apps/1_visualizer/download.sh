release=octant_0.25.1_Linux-64bit
URL=https://github.com/vmware-archive/octant/releases/download/v0.25.1/$release.tar.gz
curl -Lo octant.tar.gz $URL
tar -xzvf octant.tar.gz $release/octant
mv $release/octant .
chmod +x octant
rm -rf $release
rm -f octant.tar.gz
export PATH=$PATH:$(pwd)

