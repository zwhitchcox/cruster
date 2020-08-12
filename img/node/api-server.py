import socketserver
import subprocess
import os
import logging
import requests
import subprocess
import http.server
import json
from http import HTTPStatus

SERVICE_PORT=9090

logFormatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
logger = logging.getLogger()

fileHandler = logging.FileHandler("api.log")
fileHandler.setFormatter(logFormatter)
logger.addHandler(fileHandler)

# uncomment to output log to console
consoleHandler = logging.StreamHandler()
consoleHandler.setFormatter(logFormatter)
logger.addHandler(consoleHandler)

def write_file(location, contents):
  fd = open(location, "w+")
  fd.write(contents)
  fd.close()

def read_file(location):
  fd = open(location, "r+")
  contents = fd.read()
  fd.close()
  return contents.rstrip()

def set_hostname(hostname):
  write_file("/etc/hostname", hostname)
  os.popen("reboot")

def exec_write(self, cmd):
  self.send_response(HTTPStatus.OK)
  self.send_header("Access-Control-Allow-Origin", "*")
  self.end_headers()
  process = subprocess.Popen(cmd,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            universal_newlines=True)
  while True:
      output = process.stdout.readline()
      err_output = process.stderr.readline()
      if output != "":
        self.wfile.write(output.encode('utf-8'))
      if err_output != "":
        self.wfile.write(("error: " + err_output).encode('utf-8'))
      # Do something else
      return_code = process.poll()
      if return_code is not None:
          self.wfile.write('RETURN CODE {}\r\n'.format(return_code).encode('utf-8'))
          # Process has finished, read rest of the output
          for output in process.stdout.readlines():
              self.wfile.write(output.encode('utf-8'))
          break

class Handler(http.server.SimpleHTTPRequestHandler):
  def _set_json_headers(self):
    self.send_response(200)
    self.send_header('Content-type', 'application/json')
    self.send_header("Access-Control-Allow-Origin", "*")
    self.end_headers()

  def _set_text_headers(self):
    self.send_response(200)
    self.send_header('Content-type', 'text/plain')
    self.send_header("Access-Control-Allow-Origin", "*")
    self.end_headers()


  def do_GET(self):
    if self.path == "/join-command":
      stream = os.popen('kubeadm token create --print-join-command')
      output = stream.read()
      if output != "":
        self.send_response(200)
        self.end_headers()
        self.wfile.write(output.encode('utf-8'))
      else:
        self.send_response(403)
        self.end_headers()
        self.wfile.write(b'Not yet ready')

    elif self.path.startswith("/set-hostname"):
      self._set_text_headers()
      new_hostname = self.path[14:]
      self.wfile.write("Will reboot after setting hostname...\r\n".encode("utf-8"))
      set_hostname(new_hostname)

    elif self.path == "/node-info":
      print("node info")
      self._set_json_headers()
      hostname = read_file("/etc/hostname")
      status = read_file("/home/pi/status")
      self.wfile.write(json.dumps({
        'hostname': hostname,
        'status': status,
      }).encode('utf-8'))

    elif self.path.startswith("/init-master"):
      self._set_text_headers()
      prefix = self.path[13:]
      print(prefix)
      # exec_write(self, ['bash', '/home/pi/kubernetes-init-master.sh'])

    elif self.path == "/reset":
      exec_write(self, ['kubeadm', 'reset', '-f'])

    # if self.path == "/node-info":
  def do_POST(self):
    content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
    post_data = self.rfile.read(content_length) # <--- Gets the data itself
    logger.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
        str(self.path), str(self.headers), post_data.decode('utf-8'))
    self.send_response(200)
    self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))

try:
  socketserver.TCPServer.allow_reuse_address = True
  httpd = socketserver.TCPServer(('', SERVICE_PORT), Handler)
  httpd.serve_forever()

except KeyboardInterrupt:
  print('^C received, shutting down the web server')
  httpd.server_close()