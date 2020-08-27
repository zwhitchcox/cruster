test_ips=(
  "192.168.1.86"
  "192.168.1.116"
  "192.168.1.118"
  "192.168.1.121"
)

# scp pi@test-node.local:/home/pi/api-server.py ./img/node/api-server.py

for ip in ${test_ips[@]};
do
  ssh root@$ip "rm /home/pi/api-server.py"
  scp ./img/node/api-server.py root@$ip:/home/pi/api-server.py
  ssh root@$ip "killall python3 >/dev/null 2>&1"
  ssh root@$ip "tmux kill-server > /dev/null 2>&1"
  ssh root@$ip "tmux new -d 'python3 /home/pi/upnp-server.py'"
  ssh root@$ip "tmux new -d 'python3 /home/pi/api-server.py'"
done
