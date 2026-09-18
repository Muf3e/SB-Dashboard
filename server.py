#!/usr/bin/env python3
import io
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "dashboard"))
sys.path.insert(0, str(ROOT_DIR / "corporate-governance"))
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from dashboard.server import SBGroupRequestHandler, main

handler = SBGroupRequestHandler

class WGIAdapter(SBGroupRequestHandler):
    def __init__(self, environ, start_response):
        self.environ = environ
        self.start_response = start_response
        self.status_code = 200
        self.status_text = 'OK'
        self.headers_sent = [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type')
        ]
        self.wfile = io.BytesIO()
        self.command = environ.get('REQUEST_METHOD', 'GET')
        self.path = environ.get('PATH_INFO', '/')
        query = environ.get('QUERY_STRING', '')
        if query:
            self.path += '?' + query
        try:
            content_len = int(environ.get('CONTENT_LENGTH', 0))
        except (ValueError, TypeError):
            content_len = 0
        stream = environ.get('wsgi.input')
        body = stream.read(content_len) if (stream and content_len > 0) else b''
        self.rfile = io.BytesIO(body)
        self.headers = {}
        for k, v in environ.items():
            if k.startswith('HTTP_'):
                h_name = k[5:].replace('_', '-').title()
                self.headers[h_name] = v
        if 'CONTENT_TYPE' in environ:
            self.headers['Content-Type'] = environ['CONTENT_TYPE']
        if 'CONTENT_LENGTH' in environ:
            self.headers['Content-Length'] = environ['CONTENT_LENGTH']

    def send_response(self, code, message=None):
        self.status_code = code
        self.status_text = message or 'OK'

    def send_header(self, keyword, value):
        self.headers_sent.append((keyword, str(value)))

    def end_headers(self):
        pass

    def send_error(self, code, message=None, explain=None):
        self.send_response(code, message or 'Error')
        self.send_header('Content-Type', 'text/plain')
        self.wfile.write((message or 'Error').encode('utf-8'))

    def dispatch(self):
        if self.command == 'OPTIONS':
            self.do_OPTIONS()
        elif self.command == 'GET':
            self.do_GET()
        elif self.command == 'POST':
            self.do_POST()
        else:
            self.send_error(405, 'Method Not Allowed')
        status = f"{self.status_code} {self.status_text}"
        self.start_response(status, self.headers_sent)
        return [self.wfile.getvalue()]


def app(environ, start_response):
    adapter = WGIAdapter(environ, start_response)
    return adapter.dispatch()

application = app

if __name__ == '__main__':
    main()
