```
//// 
modul 4
0. instalasi Mikrotik CHR
-> /system identity|history|backup|reset-configuration <>
-> /undo /redo
-> /export <>
-> autocompletion by TAB

1. Subnetting
a. Intro dan dasar teori
b. IP address (+ Field Header IPv4)
c. NID, Broadcast Addr, Available Hosts, Subnet Calculator (Manual using Tree and Website)
d. SUBNETTING
-> Classful
-> CIDR (VLSM dan FLSM)
e. SUPERNETTING
f. contoh implementasi dan perhitungan pakai tabel
-> /ip address/route/dns <>
-> /ip address add <>
-> /ip address print <>
-> /ip address remove <>
-> /ip dhcp-client <>
-> /interface <>

2. Static Routing Lanjutan
a. Multi-hop routing
b. Route summarization dan longest prefix match
c. Routing Loop dan TTL
d. implementation
-> /ip route print
-> /ip route add <>
-> /ip route remove <>
-> /ip route set <>
-> /ip dns print
-> /ip dns set <>
-> /ping
-> /log print
-> /tool traceroute

3. Dynamic Routing + Mikrotik CHR commands
a. teori
-> Pengenalan Dynamic Routing (Definisi, Tujuan)
-> Pembagian (Algoritma dan Batasan)
-> Protokol (RIP dan OSPF)
-> Redundancy dan Failover, Routing Convergence
(copas aja dari tahun lalu buat 3 sama 1)

-- start dari sini adalah implementasi
/routing rip instance
    add <>
    print
    set <>
/routing rip interface-template
    add <>
    print
    set <>
    remove <>
/routing rip neighbor
    print
/routing rip interface
    print
    
/routing ospf instance
    add <>
    print
    set <>
/routing ospf area
    add <>
    print
    set <>
/routing ospf interface-template
    add <>
    print
    set <>
    remove <>
/routing ospf neighbor
    print
/routing ospf interface
    print

bisa mengambil yang ada di modul tahun 2025, tapi disesuaikan screenshot dan konfigurasi nya (didasarkan pada mikrotik chr, netics-pc tetep digunain sebagai client atau server, mikrotik chr cuma dipakai sbg router)
```