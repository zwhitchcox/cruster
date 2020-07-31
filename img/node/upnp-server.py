import logging
import uuid
import socket
import re
import netifaces as ni
from time import sleep
import logging
import requests

SSDP_PORT = 1900
SSDP_ADDR = '239.255.255.250'
SERVER_ID = 'Cruster SSDP Server'
SERVICE_PORT = 9090
INTERFACE_NAMES = ['eth0', 'wlan0']

device_uuid = uuid.uuid4()

logFormatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
logger = logging.getLogger()

fileHandler = logging.FileHandler("upnp.log")
fileHandler.setFormatter(logFormatter)
logger.addHandler(fileHandler)

# uncomment to output log to console
# consoleHandler = logging.StreamHandler()
# consoleHandler.setFormatter(logFormatter)
# logger.addHandler(consoleHandler)

logger.setLevel(logging.DEBUG)

def get_network_interface_ip_address(interface_names=['eth0', 'wlan0']):
    """
    Get the first IP address of a network interface.
    :param interface: The name of the interface.
    :return: The IP address.
    """
    while True:
        for interface_name in interface_names:
            if interface_name not in ni.interfaces():
                logger.warning('Could not find interface %s.' % (interface_name,))
            interface = ni.ifaddresses(interface_name)
            if (2 not in interface) or (len(interface[2]) == 0):
                logger.warning('Could not find IP of interface %s. Sleeping.' % (interface,))
                sleep(60)
                continue
            return interface[2][0]['addr']


def datagram_received(data, host_port):
    (host, port) = host_port

    try:
        header, payload = data.decode().split('\r\n\r\n')[:2]
    except ValueError as err:
        logger.error(err)
        return
    lines = header.split('\r\n')
    cmd = lines[0].split(' ')
    lines = map(lambda x: x.replace(': ', ':', 1), lines[1:])
    lines = filter(lambda x: len(x) > 0, lines)

    headers = [x.split(':', 1) for x in lines]
    headers = dict(map(lambda x: (x[0].lower(), x[1]), headers))

    logger.info('SSDP command %s %s - from %s:%d' % (cmd[0], cmd[1], host, port))
    logger.debug('with headers: {}.'.format(headers))
    if cmd[0] == 'M-SEARCH' and cmd[1] == '*':
        # SSDP discovery
        logger.info("discovery from {}".format(host))
        discovery_request(headers, (host, port))
    elif cmd[0] == 'NOTIFY' and cmd[1] == '*':
        # SSDP presence
        logger.debug('NOTIFY *')
    else:
        logger.warning('Unknown SSDP command %s %s' % (cmd[0], cmd[1]))

def discovery_request(headers, host_port):
    """Process a discovery request.  The response must be sent to
    the address specified by (host, port)."""

    (host, port) = host_port

    if headers['st'] == "cruster:node":
        local_ip_address = get_network_interface_ip_address(INTERFACE_NAMES)
        response = ['HTTP/1.1 200 OK']
        response.append('ST: cruster:node')
        response.append('USN: uuid:{}::upnp:rootdevice'.format(device_uuid))
        response.append('MAN: local')
        response.append('LOCATION: http://{}:{}'.format(local_ip_address, SERVICE_PORT))
        logger.info('\r\n'.join(response))


        # send_it('\r\n'.join(response), (host, port), 0, None)
        try:
            sock.sendto('\r\n'.join(response).encode(), (host, port))
        except (AttributeError, socket.error) as msg:
            logger.warning("failure sending out byebye notification: %r" % msg)


def wait_for_internet():
  url = "https://www.google.com"
  timeout = 5
  logger.info("Waiting for internet")
  while True:
    try:
      requests.get(url, timeout=timeout)
      logger.info("Connected to the Internet")
      break
    except (requests.ConnectionError, requests.Timeout) as exception:
      logger.info("No internet connection.")
      sleep(5)

if __name__ == '__main__':
    logger.info("starting")
    wait_for_internet()
    sock = socket.socket(socket.AF_INET, # Internet
                        socket.SOCK_DGRAM) # UDP
    # sock.bind((UDP_IP, UDP_PORT))
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    if hasattr(socket, "SO_REUSEPORT"):
        try:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
        except socket.error as le:
            # RHEL6 defines SO_REUSEPORT but it doesn't work
            if le.errno == ENOPROTOOPT:
                pass
            else:
                raise

    addr = socket.inet_aton(SSDP_ADDR)
    interface = socket.inet_aton('0.0.0.0')
    cmd = socket.IP_ADD_MEMBERSHIP
    sock.setsockopt(socket.IPPROTO_IP, cmd, addr + interface)
    sock.bind(('0.0.0.0', SSDP_PORT))
    sock.settimeout(1)

    while True:
        try:
            data, addr = sock.recvfrom(1024) # buffer size is 1024 bytes
            datagram_received(data, addr)
        except socket.timeout:
            continue