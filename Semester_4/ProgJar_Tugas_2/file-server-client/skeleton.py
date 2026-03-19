import socket
import unittest
from io import StringIO
from unittest.mock import MagicMock, patch


def download_file(filename):
    # create socket
    client_socket = socket.socket()

    try:
        # define address
        host = "127.0.0.1"
        port = 12345

        # connect to server
        client_socket.connect((host, port))
        print(f"Connected to server on port {port}")

        # send all message
        client_socket.sendall(filename.encode())

        response = b""
        while True:
            # receive message
            part = client_socket.recv(1024)
            if not part:
                break
            response += part

        print("Received from server:")

        # print response
        print(response.decode())

    finally:
        # close socket
        client_socket.close()
        print("Connection closed.")


def main():
    # Example usage
    filename = input("Enter the filename to download: ")
    download_file(filename)


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


# Unit tests
class TestDownloadFile(unittest.TestCase):
    @patch("socket.socket")
    def test_download_file_success(self, mock_socket):
        print("Testing file download success ...")
        host = "127.0.0.1"  # Localhost
        port = 12345  # Port to listen on

        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance

        # Mock the recv to simulate receiving chunks of file content
        mock_socket_instance.recv.side_effect = [
            b"Hello, this is the content",
            b" of example.txt",
            b"",
        ]

        # Execute
        download_file("example.txt")

        # Assertions
        mock_socket_instance.connect.assert_called_with((host, port))
        print(f"connect called with: {mock_socket_instance.connect.call_args}")
        mock_socket_instance.sendall.assert_called_with(b"example.txt")
        print(f"sendall called with: {mock_socket_instance.sendall.call_args}")

    @patch("socket.socket")
    def test_download_file_non_existing(self, mock_socket):
        print("Testing file download not exist ...")
        host = "127.0.0.1"  # Localhost
        port = 12345  # Port to listen on

        mock_socket_instance = MagicMock()
        mock_socket.return_value = mock_socket_instance

        mock_socket_instance.recv.side_effect = [b"File not found.", b""]

        # Execute
        download_file("non_existent_file.txt")

        # Assertions
        mock_socket_instance.connect.assert_called_with((host, port))
        print(f"connect called with: {mock_socket_instance.connect.call_args}")
        mock_socket_instance.sendall.assert_called_with(b"non_existent_file.txt")
        print(f"sendall called with: {mock_socket_instance.sendall.call_args}")
        mock_socket_instance.recv.assert_called_with(1024)
        print(f"recv called with: {mock_socket_instance.recv.call_args}")


if __name__ == "__main__":
    # run unit test
    # make sure to uncomment this before submitting to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # run the client program
    # uncomment this if you want to connect to the real server
    # main()
