import socket
import unittest
import hashlib
from io import StringIO
from unittest.mock import patch, MagicMock

# Client functionality
def client_program():
    host = ?
    port = ?
    message = "Hello, Server! Please hash this message."

    # create socket
    client_socket = ?

    # connect to server
    ?
    
    # Send the message to the server
    ?
    
    # Receive the hash from the server
    hash_response = ?
    
    # Print the original message and the received hash
    print(f"Original message: {message}")
    print(f"Received hash: {hash_response}")

    # close socket
    ?

# Unit test for the client code
class TestClient(unittest.TestCase):
    @patch('socket.socket')  # Mock the socket object
    def test_client_program(self, mock_socket):
        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance

        # Test message
        test_message = "Hello, Server! Please hash this message."
        
        # Calculate the MD5 hash dynamically instead of hardcoding
        expected_hash = hashlib.md5(test_message.encode()).hexdigest()
        mock_socket_instance.recv.return_value = expected_hash.encode()

        # Run the client program without capturing stdout
        client_program()

        # Print the output that would show during the test
        # print(f"Original message: {test_message}")
        # print(f"Received hash: {expected_hash}")

        # Verify connection to the correct server and port
        mock_socket_instance.connect.assert_called_with(('127.0.0.1', 12345))
        print(f"connect called with: {mock_socket_instance.connect.call_args}")

        # Verify the client sends the correct message
        mock_socket_instance.send.assert_called_with(test_message.encode())
        print(f"send called with: {mock_socket_instance.send.call_args}")

        # Verify the client receives a response
        mock_socket_instance.recv.assert_called_with(1024)
        print(f"recv called with: {mock_socket_instance.recv.call_args}")

        # Verify the client closes the socket after receiving the hash
        mock_socket_instance.close.assert_called_once()
        print(f"close called with: {mock_socket_instance.close.call_args}")

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

if __name__ == '__main__':
    # Run unittest with a custom runner that suppresses output
    # Make sure to uncomment this before uploading the code to domjudge
    # runner = unittest.TextTestRunner(stream=NullWriter())
    # unittest.main(testRunner=runner, exit=False)

    # Uncomment this if you want to run the client program, not running the unit test
    client_program()