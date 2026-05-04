import socket
import select
import sys
import unittest
from unittest.mock import MagicMock, patch
from io import StringIO


def get_first_length(data):
    header, _, body = data.partition('\r\n\r\n')
    lines = header.split('\r\n')
    
    header_length = int(len(header))
    content_length = 0
    for line in lines:
        if line.lower().startswith('content-length:'):
            try:
                content_length = int(line.split(':')[1])
            except ValueError:
                return 0
    return header_length + content_length
    

def create_socket():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(('localhost', 8080))
    return client_socket

def client():
    client_socket = create_socket()

    request_header = (
        "GET index.html HTTP/1.1\r\n"
        "Host: localhost\r\n\r\n"
    )

    request_header = request_header.encode('utf-8')

    try:

        client_socket.send(request_header)
        response = b''
        while True:
            part = client_socket.recv(1024)
            response += part 
            if len(part) < 1024:
                break
        
        print(response.decode('utf-8'))

    finally:
        client_socket.close()

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')

class TestHttpClient(unittest.TestCase):
    def test_get_first_length_no_content_length(self):
        print('Testing get_first_length_no_content_length ...')
        data = "HTTP/1.1 200 OK\r\nServer: TestServer\r\n\r\n"
        assert_equal(get_first_length(data), len(data.split('\r\n\r\n')[0]))

    def test_get_first_length_with_content_length(self):
        print('Testing get_first_length_with_content_length ...')
        data = "HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\n12345"
        assert_equal(get_first_length(data), len(data.split('\r\n\r\n')[0]) + 5)

    @patch('socket.socket')
    def test_create_socket(self, mock_socket):
        print('Testing create_socket ...')
        create_socket()
        mock_socket.assert_called_once_with(socket.AF_INET, socket.SOCK_STREAM)
        instance = mock_socket.return_value
        instance.connect.assert_called_once_with(('localhost', 8080))
        print(f"connect called with: {instance.connect.call_args}")

    @patch('socket.socket')
    def test_client(self, mock_socket):
        print('Testing client ...')
        # Setup the mock socket
        mock_sock_instance = MagicMock()
        mock_socket.return_value = mock_sock_instance
        mock_sock_instance.recv.side_effect = [b'HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\n12345', b'']

        # Call the client function
        client()

        # Check socket methods were called correctly
        mock_sock_instance.connect.assert_called_with(('localhost', 8080))
        print(f"connect called with: {mock_sock_instance.connect.call_args}")

        mock_sock_instance.send.assert_called_once()
        print(f"send called with: {mock_sock_instance.send.call_args}")

        mock_sock_instance.recv.assert_called_once()  # Ensure 'recv' was called
        print(f"recv called with: {mock_sock_instance.recv.call_args}")

        mock_sock_instance.close.assert_called_once()
        print(f"close called with: {mock_sock_instance.close.call_args}")


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        client()

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
    
