import socket
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

def client_program():
    host = "127.0.0.1"
    port = 12345
    client_socket = socket.socket()
    client_socket.connect((host, port))
    message = b'10 + 5'
    client_socket.send(message)
    print(f"Sending to server: {message.decode()}")
    response = client_socket.recv(1024)
    print(f"Received from server: {response.decode()}")
    
    # close
    client_socket.close()

class TestClient(unittest.TestCase):
    @patch('socket.socket')
    def test_client_program(self, mock_socket):
        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance
        mock_socket_instance.recv.side_effect = [b'15']
        client_program()
        mock_socket_instance.connect.assert_called_with(('127.0.0.1', 12345))
        print(f"connect called with: {mock_socket_instance.connect.call_args}")
        mock_socket_instance.send.assert_called_with(b'10 + 5')
        print(f"send called with: {mock_socket_instance.send.call_args}")
        mock_socket_instance.recv.assert_called_with(1024)
        print(f"recv called with: {mock_socket_instance.recv.call_args}")
        mock_socket_instance.close.assert_called_once()
        print(f"close called with: {mock_socket_instance.close.call_args}")

class NullWriter(StringIO):
    def write(self, txt):
        pass

if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
    # client_program()
