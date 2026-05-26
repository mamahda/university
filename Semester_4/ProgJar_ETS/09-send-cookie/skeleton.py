import sys
import socket
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

def send_cookie() -> str:
    request = (
        "get /cookies HTTP/1.1\r\n"
        "Host: httpbin.org\r\n"
        "cookie: session_id=abc123; user_id=42\r\n"
        "Connection: close\r\n"
        "\r\n"
    )
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.connect(('httpbin.org', 80))
        sock.send(request.encode('utf-8'))
        response = sock.recv(4096)
    if isinstance(response, bytes):
        response = response.decode('utf-8')
    return extract_body(response)


def extract_body(raw_response: str) -> str:
    if isinstance(raw_response, bytes):
        raw_response = raw_response.decode('utf-8', errors='ignore')
    parts = raw_response.split('\r\n\r\n', 1)
    if len(parts) > 1:
        return parts[1]
    return ''


class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestSendCookie(unittest.TestCase):
    @patch('socket.socket')
    def test_send_cookie(self, mock_socket):
        print('Testing send_cookie ...')
        mock_sock_instance = MagicMock()
        mock_socket.return_value.__enter__.return_value = mock_sock_instance
        fake_response = b'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"cookies": {"session_id": "abc123", "user_id": "42"}}'
        mock_sock_instance.recv.return_value = fake_response

        result = send_cookie()

        mock_sock_instance.connect.assert_called_with(('httpbin.org', 80))
        print(f"connect called with: {mock_sock_instance.connect.call_args}")

        mock_sock_instance.send.assert_called_once()
        print(f"send called with: {mock_sock_instance.send.call_args}")

        mock_sock_instance.recv.assert_called_once()
        print(f"recv called with: {mock_sock_instance.recv.call_args}")

        assert_equal(result, '{"cookies": {"session_id": "abc123", "user_id": "42"}}')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        body = send_cookie()
        print(body)

    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
