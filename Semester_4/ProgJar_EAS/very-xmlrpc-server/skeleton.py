from http.server import BaseHTTPRequestHandler, HTTPServer
import xml.etree.ElementTree as ET
import unittest
from unittest.mock import patch, MagicMock, call
from io import StringIO


class XMLRPCServer(BaseHTTPRequestHandler):
    def do_POST(self):
        length = ?
        data = ?

        root = ?

        method = ?

        values = ?
        numbers = ?

        if method == "add":
            result = ?

            response = f"""<?xml version="1.0"?>
<methodResponse>
  <params>
    <param>
      ?
    </param>
  </params>
</methodResponse>
"""
        else:
            response = """<?xml version="1.0"?>
<methodResponse>
  <fault>
    ?
  </fault>
</methodResponse>
"""

        response = response.encode("utf-8")

        self.send_response?
        self.send_header?
        self.send_header?
        self.end_headers?
        self.wfile.?


def main():
    server = ?
    print("XML-RPC server running on http://127.0.0.1:8000")
    print("Available method: add(a, b)")
    print("Press Ctrl+C to stop")
    try:
        ?
    except KeyboardInterrupt:
        pass


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestXMLRPCServer(unittest.TestCase):

    def _make_handler(self, xml_str):
        xml_bytes = xml_str.encode('utf-8')
        handler = object.__new__(XMLRPCServer)
        handler.headers = {'Content-Length': str(len(xml_bytes))}
        handler.rfile = MagicMock()
        handler.rfile.read.return_value = xml_bytes
        handler.wfile = MagicMock()
        handler.send_response = MagicMock()
        handler.send_header = MagicMock()
        handler.end_headers = MagicMock()
        return handler

    def test_do_post_add(self):
        xml_request = (
            '<?xml version="1.0"?>'
            '<methodCall>'
            '<methodName>add</methodName>'
            '<params>'
            '<param><value><int>3</int></value></param>'
            '<param><value><int>4</int></value></param>'
            '</params>'
            '</methodCall>'
        )
        handler = self._make_handler(xml_request)
        handler.do_POST()

        assert_equal(handler.send_response.call_args, call(200))
        assert_equal(b'<int>7</int>' in handler.wfile.write.call_args[0][0],
                     True)

    def test_do_post_unknown(self):
        xml_request = (
            '<?xml version="1.0"?>'
            '<methodCall>'
            '<methodName>multiply</methodName>'
            '<params>'
            '<param><value><int>3</int></value></param>'
            '<param><value><int>4</int></value></param>'
            '</params>'
            '</methodCall>'
        )
        handler = self._make_handler(xml_request)
        handler.do_POST()

        assert_equal(handler.send_response.call_args, call(200))
        assert_equal(b'Unknown method' in handler.wfile.write.call_args[0][0],
                     True)

    @patch('__main__.HTTPServer')
    def test_main(self, mock_server_cls):
        mock_server_instance = MagicMock()
        mock_server_cls.return_value = mock_server_instance
        mock_server_instance.serve_forever.side_effect = KeyboardInterrupt

        main()

        assert_equal(mock_server_cls.call_args[0][0], ('127.0.0.1', 8000))
        assert_equal(mock_server_instance.serve_forever.called, True)


if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
