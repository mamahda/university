import unittest
import socket
from io import StringIO
from unittest.mock import patch, MagicMock

# Server functionality for UDP
def handle_client_message(server_socket, data, addr):
    """Handle a single client message."""
    print(f"Received from {addr}: {data.decode()}")

    # send a response back to the client
    response = b'Hello, Client!'
    server_socket.sendto(response, addr)

def start_server():
    """Start the UDP server and listen for incoming datagrams."""
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    host = '127.0.0.1'
    port = 12345
    # bind the server socket to the host and port
    server_socket.bind((host, port))

    print(f"UDP server listening on {host}:{port} ...")
    try:
        while True:
            data, addr = server_socket.recvfrom(1024)
            handle_client_message(server_socket, data, addr)
    except KeyboardInterrupt:
        print("Server interrupted.")
    finally:
        # close the server socket
        server_socket.close()

class ExitLoopException(Exception):
    pass

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

# Unit test for UDP server
class TestServer(unittest.TestCase):
    @patch('socket.socket')
    def test_handle_client_message(self, mock_socket):
        """Test handling of a client message in UDP."""
        print('Test handle_client_message ...')
        mock_server_socket = MagicMock()
        mock_data = b'Hello, Server!'
        mock_addr = ('127.0.0.1', 54321)

        handle_client_message(mock_server_socket, mock_data, mock_addr)

        mock_server_socket.sendto.assert_called_with(b'Hello, Client!', mock_addr)
        print(f"sendto called with: {mock_server_socket.sendto.call_args}")

    @patch('socket.socket')
    def test_start_server(self, mock_socket):
        """Test starting of the UDP server and receiving data."""
        print('Test start_server ...')
        mock_server_socket = MagicMock()
        mock_socket.return_value = mock_server_socket

        mock_data = b'Hello, Server!'
        mock_addr = ('127.0.0.1', 54321)
        # simulate one datagram received, then raise to stop the loop
        mock_server_socket.recvfrom.side_effect = [(mock_data, mock_addr), ExitLoopException]

        try:
            start_server()
        except ExitLoopException:
            pass

        mock_server_socket.bind.assert_called_once_with(('127.0.0.1', 12345))
        print(f"bind called with: {mock_server_socket.bind.call_args}")

        mock_server_socket.recvfrom.assert_called()
        print(f"recvfrom called with: {mock_server_socket.recvfrom.call_args}")

if __name__ == '__main__':
    # Run unittest with a custom runner that suppresses output
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment this if you want to run the server
    # start_server()
