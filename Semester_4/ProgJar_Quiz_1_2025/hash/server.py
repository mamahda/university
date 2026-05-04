import socket
import hashlib
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

# Server function
def handle_client_connection(client_socket, addr):
    """Handle a single client connection."""
    print(f"Got a connection from {addr}")
    
    # Receive message from client
    data = ?
    
    # Calculate MD5 hash
    md5_hash = hashlib.md5(?).hexdigest()
    
    # Send hash back to client
    ?
    
    # close socket
    ?

def start_server():
    """Start the server and listen for incoming connections."""
    # create socket
    server_socket = ?

    # define the address
    host = ?        # Localhost
    port = ?        # Port to listen on

    # bind to address
    ?

    # listen
    ?

    print(f"Listening on {host}:{port} ...")
    try:
        while True:
            client_socket, addr = server_socket.accept()
            handle_client_connection(client_socket, addr)
    except KeyboardInterrupt:
        print("Server shutting down.")
    finally:
        # close socket
        ?

class ExitLoopException(Exception):
    pass

# 'Null' stream to discard output (not used here)
class NullWriter(StringIO):
    def write(self, txt):
        pass

# Unit test for server
class TestServer(unittest.TestCase):
    @patch('socket.socket')
    def test_handle_client_connection(self, mock_socket):
        """Test handling of a client connection."""
        print('Test handle_client_connection ...')
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)
        
        # Setup mock to return message when recv is called
        test_message = "Hello, Server! Please hash this message."
        mock_client_socket.recv.return_value = test_message.encode()
        
        # Calculate the MD5 hash dynamically instead of hardcoding
        expected_hash = hashlib.md5(test_message.encode()).hexdigest()
        
        handle_client_connection(mock_client_socket, mock_addr)
        
        # Verify that recv was called with the correct parameter
        mock_client_socket.recv.assert_called_with(1024)
        print(f"recv called with: {mock_client_socket.recv.call_args}")
        
        # Verify that the correct hash was sent to the client
        mock_client_socket.send.assert_called_with(expected_hash.encode())
        print(f"send called with: {mock_client_socket.send.call_args}")
        
        # Verify that the connection was closed
        mock_client_socket.close.assert_called_once()
        print(f"close called with: {mock_client_socket.close.call_args}")

    @patch('socket.socket')
    def test_start_server(self, mock_socket):
        """Test starting of the server and listening for connections."""
        print('Test start_server ...')
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)
        
        # Important: Set return value for recv to prevent errors
        test_message = "Test message for start_server"
        mock_client_socket.recv.return_value = test_message.encode()
    
        mock_socket.return_value = mock_server_socket
        # Use ExitLoopException to exit the loop after 1 connection
        mock_server_socket.accept.side_effect = [(mock_client_socket, mock_addr), ExitLoopException]
        
        try:
            start_server()
        except ExitLoopException:
            pass  # Exit the loop as expected
        
        print(f"accept called with: {mock_server_socket.accept.call_args}")

        # Verify server setup
        mock_server_socket.bind.assert_called_once_with(('127.0.0.1', 12345))
        print(f"bind called with: {mock_server_socket.bind.call_args}")

        mock_server_socket.listen.assert_called_once_with(1)
        print(f"listen called with: {mock_server_socket.listen.call_args}")

if __name__ == '__main__':
    # Use sys.stdout to make print output visible in console
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment the following line if you want to run the server directly, not the unit test
    # start_server()