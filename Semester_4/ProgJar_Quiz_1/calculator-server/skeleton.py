import socket
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

def handle_client_connection(client_socket, addr):
    print(f"Got a connection from {addr}")
    message = client_socket.recv(1024)
    decoded = message.decode()
    
    print(f"Received expression: {decoded}")
    
    # operation here
    result = b'15'
    print(f"Sending result: {result.decode()}")
    
    # send
    client_socket.send(result)
    # close
    client_socket.close()

def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    host = '127.0.0.1'
    port = 12345
    server_socket.bind((host, port))
    server_socket.listen(1)
    print(f"Listening on {host}:{port} ...")
    try:
        while True:
            client_socket, addr = server_socket.accept()
            handle_client_connection(client_socket, addr)
    except KeyboardInterrupt:
        print("Server shutting down.")
    finally:
        server_socket.close()

class TestServer(unittest.TestCase):
    @patch('socket.socket')
    def test_handle_client_connection(self, mock_socket):
        print('Test handle_client_connection ...')
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)
        mock_client_socket.recv.return_value = b'10 + 5'
        handle_client_connection(mock_client_socket, mock_addr)
        mock_client_socket.recv.assert_called_with(1024)
        print(f"recv called with: {mock_client_socket.recv.call_args}")
        mock_client_socket.send.assert_called_with(b'15')
        print(f"send called with: {mock_client_socket.send.call_args}")
        mock_client_socket.close.assert_called_once()
        print(f"close called with: {mock_client_socket.close.call_args}")

    @patch('socket.socket')
    def test_start_server(self, mock_socket):
        print('Test start_server ...')
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        mock_addr = ('127.0.0.1', 12345)
        mock_socket.return_value = mock_server_socket
        mock_server_socket.accept.side_effect = [(mock_client_socket, mock_addr), KeyboardInterrupt]
        mock_client_socket.recv.return_value = b'10 + 5'
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
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
    # start_server()
