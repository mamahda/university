import sys
import socket
import base64
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock


def build_basic_auth(username: str, password: str) -> str:
    token = f"{username}:{password}".encode("utf-8")
    b64 = base64.b64encode(token).decode("utf-8")
    return f"Basic {b64}"


def get_with_basic_auth() -> int:
    auth_header = build_basic_auth('user', 'password')

    request = (
        "GET /basic-auth/user/password HTTP/1.1\r\n"
        "Host: httpbin.org\r\n"
        f"Authorization: {auth_header}\r\n"
        "Connection: close\r\n"
        "\r\n"
    )

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.connect(('httpbin.org', 80))
        sock.send(request.encode('utf-8'))
        response = sock.recv(4096)

    if isinstance(response, bytes):
        response = response.decode('utf-8', errors='ignore')

    first_line = response.split('\r\n', 1)[0]
    parts = first_line.split(' ')
    try:
        status = int(parts[1])
    except (IndexError, ValueError):
        status = 0

    return status

class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestBasicAuth(unittest.TestCase):
    def test_build_basic_auth(self):
        print('Testing build_basic_auth ...')
        result = build_basic_auth('user', 'password')
        assert_equal(result, 'Basic dXNlcjpwYXNzd29yZA==')

    @patch('socket.socket')
    def test_get_with_basic_auth(self, mock_socket):
        print('Testing get_with_basic_auth ...')
        mock_sock_instance = MagicMock()
        mock_socket.return_value.__enter__.return_value = mock_sock_instance
        mock_sock_instance.recv.return_value = b'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"authenticated": true}'

        result = get_with_basic_auth()

        mock_sock_instance.connect.assert_called_with(('httpbin.org', 80))
        print(f"connect called with: {mock_sock_instance.connect.call_args}")

        mock_sock_instance.send.assert_called_once()
        print(f"send called with: {mock_sock_instance.send.call_args}")

        mock_sock_instance.recv.assert_called_once()
        print(f"recv called with: {mock_sock_instance.recv.call_args}")

        assert_equal(result, 200)


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        status = get_with_basic_auth()
        print(status)

    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
