nohup ./octant  \
	--disable-open-browser \
	--disable-origin-check  \
	--listener-addr :22222 \
	--accepted-hosts 0.0.0.0 &
echo $! > octant.pid
