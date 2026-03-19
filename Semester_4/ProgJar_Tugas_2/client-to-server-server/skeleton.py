import socket
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock


# Server functionality
def handle_client_connection(client_socket, addr):
    """Handle a single client connection."""
    print(f"Got a connection from {addr}")

    # receive message
    message = client_socket.recv(1024)
    print(f"Received from client: {message}")

    # close socket
    client_socket.close()


def start_server():
    """Start the server and listen for incoming connections."""
    # create socket
    server_socket = socket.socket()

    # define address
    host = "127.0.0.1"
    port = 12345

    # bind
    server_socket.bind((host, port))

    # listen
    server_socket.listen(1)
    print(f"Listening on {host}:{port} ...")

    try:
        while True:
            # accept connection
            client_socket, addr = server_socket.accept()

            # handle connection
            handle_client_connection(client_socket, addr)
    except KeyboardInterrupt:
        print("Server shutting down.")
    finally:
        # close socket
        server_socket.close()


class ExitLoopException(Exception):
    pass


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


# Unit test for server
class TestServer(unittest.TestCase):
    @patch('socket.socket')
    def test_handle_client_connection(self, mock_socket):
        """Test handling of a client connection."""
        print('Testing handle_client_connection ...')
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)
        mock_client_socket.recv.return_value = b'Hello, Server!'
        handle_client_connection(mock_client_socket, mock_addr)

        mock_client_socket.recv.assert_called_with(1024)
        print(f"recv called with: {mock_client_socket.recv.call_args}")

        mock_client_socket.close.assert_called_once()
        print(f"close called with: {mock_client_socket.close.call_args}")

    @patch('socket.socket')
    def test_start_server(self, mock_socket):
        """Test starting of the server and listening for connections."""
        print('Testing start_server ...')
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)

        mock_socket.return_value = mock_server_socket
        # Use ExitLoopException to exit the loop after simulating a single client connection
        mock_server_socket.accept.side_effect = [(mock_client_socket, mock_addr), ExitLoopException]

        # Run start_server and catch the custom ExitLoopException to exit the test cleanly
        try:
            mock_client_socket.recv.return_value = b'Hello, Server!'
            start_server()
            # Ensure the loop was exited due to the ExitLoopException
            mock_server_socket.accept.assert_called()
        except ExitLoopException:
            pass  # Loop exited as expected

        print(f"accept called with: {mock_server_socket.accept.call_args}")

        # Assertions to verify the server setup
        mock_server_socket.bind.assert_called_once_with(('127.0.0.1', 12345))
        print(f"bind called with: {mock_server_socket.bind.call_args}")

        mock_server_socket.listen.assert_called_once_with(1)
        print(f"listen called with: {mock_server_socket.listen.call_args}")


# Automatically execute the unit tests when the script is run
if __name__ == '__main__':
    # Run unittest with a custom runner that suppresses output
    # Make sure to uncomment this before uploading the code to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment this if you want to run the client program, not running the unit test
    # start_server()
