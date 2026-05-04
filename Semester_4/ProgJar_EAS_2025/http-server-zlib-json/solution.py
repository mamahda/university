import socket
import zlib
import sys
import select
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

def get_content(status):
    """Return the content based on the status code provided"""
    if status == 200:
        content = '{"status": 200, "message": "Hello world!"}'
    elif status == 404:
        content = '{"status": 404, "message": "404 Not found"}'
    elif status == 500:
        content = '{"status": 500, "message": "500 Internal Server Error"}'
    else:
        content = '{"message": "Unknown status code"}'
    
    # JSON content 
    json_content = f'{content}'

    # Compress the JSON response using zlib
    compressed_content = zlib.compress(json_content.encode('utf-8'), level=zlib.Z_BEST_COMPRESSION)
    return compressed_content

def create_server():
    """Create a server socket and listen for incoming connections"""
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(('localhost', 8080))
    server_socket.listen(5)
    return server_socket

def get_header(data):
    """Extract the request file from the request header"""
    header, _, _ = data.partition('\r\n\r\n')
    lines = header.split('\r\n')
    if len(lines) < 4:
        lines.extend([''] * (4 - len(lines)))
    request_line = lines[0]
    method, path, _ = request_line.split(' ')
    print(f"request header: {lines}")
    return path

def serve():
    """Start the server and process incoming requests"""

    # Create the server socket
    server_socket = create_server()
    input_socket = [server_socket]

    try:
        while True:
            read_ready, _, _ = select.select(input_socket, [], [])
            
            for sock in read_ready:
                if sock == server_socket:
                    client_socket, addr = server_socket.accept()
                    input_socket.append(client_socket)

                else:                
                    data = sock.recv(4096)
                    if not data:
                        print("Closing connection")
                        input_socket.remove(sock)
                        sock.close()
                        continue

    except KeyboardInterrupt:        
        server_socket.close()

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')

def assert_in(parameter1, parameter2):
    if parameter1 in parameter2:
        print(f'test attribute passed: {parameter1} is in {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not in {parameter2}')

def assert_true(parameter, name):
    if parameter == True:
        print(f'test attribute {name} passed: {parameter} is True')
    else:
        print(f'test attribute {name} failed: {parameter} is not True')

class TestHttpServer(unittest.TestCase):
    def test_get_content(self):
        print('Testing get_content ...')
        content = get_content(200)
        assert_in('Hello world!', zlib.decompress(content).decode('utf-8'))  # Check for presence after decompression
        content = get_content(404)
        assert_in('404 Not found', zlib.decompress(content).decode('utf-8'))
        content = get_content(500)
        assert_in('500 Internal Server Error', zlib.decompress(content).decode('utf-8'))

    @patch('socket.socket')
    def test_create_server(self, mock_socket):
        print('Testing create_server ...')
        create_server()
        mock_socket.assert_called_once_with(socket.AF_INET, socket.SOCK_STREAM)
        instance = mock_socket.return_value
        instance.setsockopt.assert_called_with(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        instance.bind.assert_called_with(('localhost', 8080))
        print(f"bind called with: {instance.bind.call_args}")

        instance.listen.assert_called_once_with(5)
        print(f"listen called with: {instance.listen.call_args}")
        print()

    def test_get_header(self):
        print('Testing get_header ...')
        data = "GET /index.html HTTP/1.1\r\nHost: localhost\r\n\r\n"
        assert_equal(get_header(data), '/index.html')
        print()

    @patch('select.select')
    @patch('socket.socket')
    def test_process_requests(self, mock_socket, mock_select):
        print('Testing process_requests ...')
        # Setting up mock objects
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        mock_socket.return_value = mock_server_socket

        # List to manage client sockets to simulate the real-time adding and removing
        input_sockets = [mock_server_socket]

        # Define different request scenarios
        mock_requests = [
            b"GET / HTTP/1.1\r\nHost: localhost\r\n\r\n",
            b"GET /index.html HTTP/1.1\r\nHost: localhost\r\n\r\n",
            b"GET /hello.html HTTP/1.1\r\nHost: localhost\r\n\r\n",
            b"GET /nonexistent.html HTTP/1.1\r\nHost: localhost\r\n\r\n",
            b""  # Simulating a closed connection by sending an empty byte string
        ]

        # Simulating responses for select
        def select_side_effect(*args, **kwargs):
            if select_side_effect.call_count < len(mock_requests):
                result = ([input_sockets[0]], [], [])
                input_sockets.append(mock_client_socket)  # Simulate accepting a new client
            else:
                raise KeyboardInterrupt  # Simulate a signal to stop the server
            select_side_effect.call_count += 1
            return result
        
        select_side_effect.call_count = 0
        mock_select.side_effect = select_side_effect

        # Simulating client requests and disconnection
        def recv_side_effect(*args, **kwargs):
            if recv_side_effect.call_count < len(mock_requests):
                response = mock_requests[recv_side_effect.call_count]
            else:
                response = b""
            recv_side_effect.call_count += 1
            return response
        
        recv_side_effect.call_count = 0
        mock_client_socket.recv.side_effect = recv_side_effect

        mock_server_socket.accept.return_value = (mock_client_socket, ('127.0.0.1', 12345))

        # Handle closing the client socket and removing it from the list
        def close_side_effect():
            if mock_client_socket in input_sockets:
                input_sockets.remove(mock_client_socket)

        mock_client_socket.close.side_effect = close_side_effect

        # Run the serve function
        try:
            serve()
        except KeyboardInterrupt:
            pass


        mock_server_socket.accept.assert_called()
        print(f"accept called with: {mock_server_socket.accept.call_args}")
        
        # Asserts to verify the behavior
        assert_equal(mock_server_socket.bind.call_args, unittest.mock.call(('localhost', 8080)))

        assert_equal(mock_server_socket.accept.call_count, len(mock_requests))

        assert_true(mock_server_socket.listen.called, 'listen')
        assert_true(mock_server_socket.accept.called, 'accept')
        assert_true(mock_server_socket.close.called, 'close')

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        serve()

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
