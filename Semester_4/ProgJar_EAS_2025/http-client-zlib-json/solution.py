import socket
import zlib
import sys
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

def get_first_length(data):
    """Get the length of the first part of the response, including the header and the content if Content-Length is present."""
    header, _, content = data.partition('\r\n\r\n')
    if 'Content-Length:' in header:
        content_length = int(header.split('Content-Length: ')[1].split('\r\n')[0])
        return len(header) + content_length
    else:
        return len(header)

def create_socket():
    """Create a client socket and connect to the server."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.connect(('localhost', 8080))
    return sock

def client():
    """Send a GET request to the server and print the response."""
    # Create socket and Send the request 
    sock = create_socket()
    request = "GET /index.html HTTP/1.1\r\nHost: localhost\r\nAccept-Encoding: gzip\r\n\r\n"
    sock.sendall(request.encode('utf-8'))
    
    while True:
        # Receive data
        data = sock.recv(4096)

        # Break if no more data
        if not data:
            break

    # Decode and Print the response
    response = data.decode('utf-8')

    # Get the status code
    status_code = int(response.split(' ')[1])

    # Print the status code
    if status_code == 200:
        print("Response received successfully.")
    else:
        print(f"Error: Received status code {status_code}")

    # Close the socket 
    sock.close()

    # Decompress and parse JSON content
    try:
        header, _, content = response.partition('\r\n\r\n')
        if 'Content-Encoding: gzip' in header:
            content = zlib.decompress(content.encode('utf-8'), zlib.MAX_WBITS | 16).decode('utf-8')
        else:
            content = content.strip()
        print("Content:", content)
    except Exception as e:
        print(f"Error decompressing content: {e}")

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

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        client()

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
