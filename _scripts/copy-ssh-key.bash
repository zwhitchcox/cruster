#!/bin/bash

test_ips=(
  "192.168.1.85"
  "192.168.1.120"
  "192.168.1.117"
  "192.168.1.115"
)

for ip in ${test_ips[@]};
do
    ssh-copy-id pi@$ip
done