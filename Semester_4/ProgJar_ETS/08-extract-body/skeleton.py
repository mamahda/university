import sys
import socket
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock


def extract_body(raw_response: str) -> str:
    parts = raw_response.split('\r\n\r\n', 1)
    if len(parts) > 1:
        return parts[1]
    return ''


def get_body() -> str:
    request = (
        "GET /get HTTP/1.1\r\n"
        "Host: httpbin.org\r\n"
        "Connection: close\r\n"
        "\r\n"
    )
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.connect(('httpbin.org', 80))
        sock.send(request.encode('utf-8'))
        response = sock.recv(4096)
    if isinstance(response, bytes):
        response = response.decode('utf-8', errors='ignore')
    return extract_body(response)

class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestExtractBody(unittest.TestCase):
    def test_extract_body(self):
        print('Testing extract_body ...')
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\nHello World'
        assert_equal(extract_body(response), 'Hello World')
        response_no_body = 'HTTP/1.1 200 OK\r\nContent-Type: text/html'
        assert_equal(extract_body(response_no_body), '')

    @patch('socket.socket')
    def test_get_body(self, mock_socket):
        print('Testing get_body ...')
        mock_sock_instance = MagicMock()
        mock_socket.return_value.__enter__.return_value = mock_sock_instance
        mock_sock_instance.recv.return_value = b'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\nmock body content'

        result = get_body()

        mock_sock_instance.connect.assert_called_with(('httpbin.org', 80))
        print(f"connect called with: {mock_sock_instance.connect.call_args}")

        mock_sock_instance.send.assert_called_once()
        print(f"send called with: {mock_sock_instance.send.call_args}")

        mock_sock_instance.recv.assert_called_once()
        print(f"recv called with: {mock_sock_instance.recv.call_args}")

        assert_equal(result, 'mock body content')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        body = get_body()
        print(body)

    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
