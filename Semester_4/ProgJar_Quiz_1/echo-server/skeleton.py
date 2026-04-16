import socket
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

def handle_client_connection(client_socket, addr):
    """Handle a single client connection."""
    print(f"Got a connection from {addr}")

    # Receiving message
    response = client_socket.recv(1024)
    print(f"Received from client: {response.decode()}")

    # Sending back the message
    client_socket.send(response)
    print(f"Sending back to client: {response.decode()}")

    # Close the socket
    client_socket.close()

def start_server():
    """Start the server and listen for incoming connections."""
    # create socket
    server_socket = socket.socket()

    # define address
    host = "127.0.0.1"
    port = 12345

    # bind address to socket
    server_socket.bind((host, port))
    
    # listen
    server_socket.listen(1)
    
    print(f"Listening on {host}:{port} ...")
    try:
        while True:
            # accept connection from client
            client_socket, addr = server_socket.accept()
            handle_client_connection(client_socket, addr)
    except KeyboardInterrupt:
        print("Server shutting down.")
    finally:
        # close socket
        server_socket.close()

class TestServer(unittest.TestCase):
    @patch('socket.socket')
    def test_handle_client_connection(self, mock_socket):
        """Test handling of a client connection."""
        print('Test handle_client_connection ...')
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)

        mock_client_socket.recv.return_value = b'Welcome into this client-server-client sending message program!'
        
        handle_client_connection(mock_client_socket, mock_addr)
        
        mock_client_socket.recv.assert_called_with(1024)
        print(f"recv called with: {mock_client_socket.recv.call_args}")
        
        mock_client_socket.send.assert_called_with(b'Welcome into this client-server-client sending message program!')
        print(f"send called with: {mock_client_socket.send.call_args}")

        mock_client_socket.close.assert_called_once()
        print(f"close called with: {mock_client_socket.close.call_args}")

    @patch('socket.socket')
    def test_start_server(self, mock_socket):
        """Test starting of the server and listening for connections."""
        print('Test start_server ...')
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)
    
        mock_socket.return_value = mock_server_socket
        mock_server_socket.accept.side_effect = [(mock_client_socket, mock_addr), KeyboardInterrupt]
        
        mock_client_socket.recv.return_value = b'Welcome into this client-server-client sending message program!'
        
        try:
            start_server()
            
        except KeyboardInterrupt:
            pass
    
        print(f"accept called with: {mock_server_socket.accept.call_args}")

        mock_server_socket.bind.assert_called_once_with(('127.0.0.1', 12345))
        print(f"bind called with: {mock_server_socket.bind.call_args}")

        mock_server_socket.listen.assert_called_once_with(1)
        print(f"listen called with: {mock_server_socket.listen.call_args}")

class NullWriter(StringIO):
    def write(self, txt):
        pass

if __name__ == '__main__':
    # Run unittest with a custom runner that suppresses output
    # Make sure to uncomment this before uploading the code to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment this if you want to run the server program, not running the unit test
    # start_server()
