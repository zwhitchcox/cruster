test_ips=(
  "192.168.1.86"
  "192.168.1.116"
  "192.168.1.118"
  "192.168.1.121"
)

# scp pi@test-node.local:/home/pi/api-server.py ./img/node/api-server.py

for ip in ${test_ips[@]};
do
  ssh root@$ip "rm /etc/cruster/api-server.py"
  ssh root@$ip "rm /etc/cruster/upnp-server.py"
  scp ./pi/node/api-server.py root@$ip:/etc/cruster/api-server.py
  scp ./pi/node/upnp-server.py root@$ip:/etc/cruster/upnp-server.py
  ssh root@$ip "killall python3 >/dev/null 2>&1"
  ssh root@$ip "tmux kill-server > /dev/null 2>&1"
  ssh root@$ip "tmux new -d 'python3 /etc/cruster/upnp-server.py'"
  ssh root@$ip "tmux new -d 'python3 /etc/cruster/api-server.py'"
done
