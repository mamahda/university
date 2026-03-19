import socket
import unittest
from io import StringIO
from unittest.mock import MagicMock, patch


# Client functionality
def client_program():
    host = "127.0.0.1"
    port = 12345

    # create socket
    client_socket = socket.socket()

    # connect to server
    client_socket.connect((host, port))

    # receive message
    message = client_socket.recv(1024)
    print(f"Received from server: {message.decode()}")

    # close socket
    client_socket.close()


# Unit test for the client code
class TestClient(unittest.TestCase):
    @patch("socket.socket")  # Mock the socket object
    def test_client_program(self, mock_socket):
        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance

        # Mock the server's response to "Hello, Client!"
        mock_socket_instance.recv.return_value = b"Hello, Client!"

        client_program()  # Run the client program

        # Verify connection to the correct server and port
        mock_socket_instance.connect.assert_called_with(("127.0.0.1", 12345))
        print(f"connect called with: {mock_socket_instance.connect.call_args}")

        # Verify the client receives a message
        mock_socket_instance.recv.assert_called_with(1024)
        print(f"recv called with: {mock_socket_instance.recv.call_args}")

        # Verify the client closes the socket after receiving the message
        mock_socket_instance.close.assert_called_once()
        print(f"close called with: {mock_socket_instance.close.call_args}")


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


if __name__ == "__main__":
    # Run unittest with a custom runner that suppresses output
    # Make sure to uncomment this before uploading the code to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment this if you want to run the client program, not running the unit test
    # client_program()
