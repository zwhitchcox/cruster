import socketserver
import os
import http.server
from http import HTTPStatus

PORT_NUMBER = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/join-command":
            stream = os.popen('kubeadm token create --print-join-command')
            output = stream.read()
            if output != "":
                self.send_response(HTTPStatus.OK)
                self.end_headers()
                self.wfile.write(output.encode('utf-8'))
            else:
                self.send_response(HTTPStatus.SERVICE_UNAVAILABLE)
                self.end_headers()
                self.wfile.write(b'Not yet ready')
        

try:
  #Create a web server and define the handler to manage the
  #incoming request
  httpd = socketserver.TCPServer(('', 8000), Handler)
  httpd.serve_forever()

except KeyboardInterrupt:
  print('^C received, shutting down the web server')
  httpd.server_close()
