import socket
import sys
import unittest
from io import StringIO
from unittest.mock import MagicMock, patch

files = {
    "example.txt": "Hello, this is the content of example.txt",
}


def handle_connection(conn, addr):
    print(f"Connected by {addr}")
    try:
        # receive message and decode bytes
        filename = conn.recv(1024).decode()

        # get file content from files variable in line 9
        file_content = files.get(filename, "File not found.")

        # send file content
        conn.sendall(file_content.encode())
    finally:
        # close socket
        conn.close()


def start_server():
    # create socket
    server_socket = socket.socket()

    # define address
    host = "127.0.0.1"
    port = 12345

    # bind address to socket
    server_socket.bind((host, port))

    # listen
    server_socket.listen(1)
    print(f"Server listening on port {host}:{port} ...")

    try:
        while True:
            # accept connection
            conn, addr = server_socket.accept()
            handle_connection(conn, addr)
    except KeyboardInterrupt:
        print("Server shutting down.")
    finally:
        # close server socket
        server_socket.close()


class ExitLoopException(Exception):
    pass


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


class TestFileServer(unittest.TestCase):
    @patch("socket.socket")
    def test_file_download_existing(self, mock_print):
        print("Testing file download existing ...")
        # Setup
        mock_conn = MagicMock()
        mock_conn.recv.return_value = b"example.txt"
        addr = ("127.0.0.1", 12345)

        # Test
        handle_connection(mock_conn, addr)

        mock_conn.recv.assert_called_with(1024)
        print(f"recv called with: {mock_conn.recv.call_args}")

        # Assertions
        mock_conn.sendall.assert_called_with(
            b"Hello, this is the content of example.txt"
        )
        print(f"sendall called with: {mock_conn.sendall.call_args}")

        mock_conn.close.assert_called_once()
        print(f"close called with: {mock_conn.close.call_args}")

    @patch("socket.socket")
    def test_file_download_non_existing(self, mock_print):
        print("Testing file download not exist ...")
        # Setup
        mock_conn = MagicMock()
        mock_conn.recv.return_value = b"non_existing_file.txt"
        addr = ("127.0.0.1", 12345)

        # Test
        handle_connection(mock_conn, addr)

        mock_conn.recv.assert_called_with(1024)
        print(f"recv called with: {mock_conn.recv.call_args}")

        # Assertions
        mock_conn.sendall.assert_called_with(b"File not found.")
        print(f"sendall called with: {mock_conn.sendall.call_args}")

        mock_conn.close.assert_called_once()
        print(f"close called with: {mock_conn.close.call_args}")


if __name__ == "__main__":
    # uncomment this to test the server on localhost
    # start_server()

    # run unit test
    # make sure to uncomment this before submitting to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
