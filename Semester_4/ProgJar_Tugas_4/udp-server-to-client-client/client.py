import unittest
import socket
from io import StringIO
from unittest.mock import patch, MagicMock

# Client functionality (UDP version)
def client_program():
    host = '127.0.0.1'
    port = 12345

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # Send an initial message to the server to prompt a response
    message = 'Hello, Server!'
    client_socket.sendto(message.encode(), (host, port))

    message, server_address = client_socket.recvfrom(1024)
    print(f"Received from server: {message.decode()}")

    # close the socket
    client_socket.close()

# Unit test for the client code (UDP version)
class TestClient(unittest.TestCase):
    @patch('socket.socket')  # Mock the socket object
    def test_client_program(self, mock_socket):
        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance

        # Mock the server's response
        mock_socket_instance.recvfrom.return_value = (b'Hello, Client!', ('127.0.0.1', 12345))

        client_program()  # Run the client program

        # Check that sendto was called with correct arguments
        mock_socket_instance.sendto.assert_called_with(b'Hello, Server!', ('127.0.0.1', 12345))
        print(f"sendto called with: {mock_socket_instance.sendto.call_args}")

        # Check that recvfrom was called
        mock_socket_instance.recvfrom.assert_called_with(1024)
        print(f"recvfrom called with: {mock_socket_instance.recvfrom.call_args}")

        # Check that the socket was closed
        mock_socket_instance.close.assert_called_once()
        print(f"close called with: {mock_socket_instance.close.call_args}")

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

if __name__ == '__main__':
    # Run unittest with a custom runner that suppresses output
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment this if you want to run the client program, not running the unit test
    # client_program()
