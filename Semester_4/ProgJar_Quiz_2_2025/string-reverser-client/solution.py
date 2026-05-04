import unittest
import socket
from io import StringIO
from unittest.mock import patch, MagicMock

def client_program():
    host = "127.0.0.1"
    port = 12345
    message = "Hello, Server! Please reverse this message."

    # create UDP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # send message to server
    client_socket.sendto(message.encode(), (host, port))

    # receive reversed string from server
    data, server = client_socket.recvfrom(1024)

    # print results
    print("Original message:", message)
    print("Received reversed:", data.decode())

    # close socket
    client_socket.close()

# Unit test for the UDP client
class TestClient(unittest.TestCase):
    @patch('socket.socket')
    def test_client_program(self, mock_socket):
        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance

        original_message = "Hello, Server! Please reverse this message."
        reversed_message = ".egassem siht esrever esaelP !revreS ,olleH"
        mock_socket_instance.recvfrom.return_value = (reversed_message.encode(), ('127.0.0.1', 12345))

        client_program()

        mock_socket_instance.sendto.assert_called_with(original_message.encode(), ('127.0.0.1', 12345))
        print(f"sendto called with: {mock_socket_instance.sendto.call_args}")

        mock_socket_instance.recvfrom.assert_called_with(1024)
        print(f"recvfrom called with: {mock_socket_instance.recvfrom.call_args}")

        mock_socket_instance.close.assert_called_once()
        print(f"close called with: {mock_socket_instance.close.call_args}")

# 'Null' stream to discard test output
class NullWriter(StringIO):
    def write(self, txt):
        pass

if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment to run actual client
    # client_program()
