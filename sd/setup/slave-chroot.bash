echo "@reboot bash /home/pi/kubernetes-init-master.sh &
@reboot python3 /home/pi/serve.py &
@reboot dphys-swapfile swapoff &" | crontab -u root -