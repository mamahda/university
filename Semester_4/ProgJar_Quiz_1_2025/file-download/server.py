import socket
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO


files = {
    "729.txt": "Content of 729.txt",
    "s41066-020-00226-2.pdf": "Content of s41066-020-00226-2.pdf",
    "xlsx.zip": "Content of xlsx.zip"
}

class Server:
    def __init__(self, host, port):
        # Define host and port
        self.host = host
        self.port = port

        # create socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # bind socket to host and port
        self.socket.bind((self.host,self.port))

    def start(self):
        # Listen for incoming connections
        self.socket.listen()
        
        while True:
            # Accept incoming connections
            conn, addr = self.socket.accept()
            print(f"Connected by {addr}")

            # Receive command and filename from client
            data = conn.recv(1024).decode()

            # get command and filename (you can use split string)
            parts = data.strip().split(" ", 1)
            command, filename = parts
            print(command, filename)

            if command != "download":
                # send "Unknown command"
                conn.sendall("Unknown command".encode())
                continue

            if filename not in files:
                # send "File {filename} doesn't exist"
                conn.sendall(f"File {filename} doesn't exist".encode())
                continue

            # Send the header to the client
            # get file_content from files dictionary
            file_content = files[filename]

            # get filesize using len() function
            filesize = len(file_content)

            # make header based on the given problem definition
            header = f"file-name: {filename},\r\nfile-size: {filesize}\r\n\r\n"

            # Send BOTH the header AND file content to the client
            conn.sendall(header.encode() + file_content.encode())

            # close socket
            conn.close()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

class TestServer(unittest.TestCase):

    @patch('socket.socket')
    def test_unknown(self, mock_socket):
        mock_conn = mock_socket.return_value
        mock_conn.recv.return_value.decode.return_value = 'Unknown command'

        conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        conn.connect(('localhost', 65432))

        conn.sendall('sample command'.encode())

        data = conn.recv(1024).decode()

        if data == 'Unknown command':
            print("test_unknown passed: Received 'Unknown command' response.")
        else:
            print("test_unknown failed: Did not receive 'Unknown command' response.")

        conn.close()

    @patch('socket.socket')
    def test_not_exists(self, mock_socket):
        mock_conn = MagicMock()
        mock_socket.return_value = mock_conn
        mock_conn.recv.return_value.decode.return_value = "File doesn't exists"

        conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        conn.connect(('localhost', 65432))

        conn.sendall('download sample.txt'.encode())

        data = conn.recv(1024).decode()

        if data == "File doesn't exists":
            print("test_not_exists passed: Received 'File doesn't exists' response.")
        else:
            print("test_not_exists failed: Did not receive 'File doesn't exists' response.")

        conn.close()

    @patch('socket.socket')
    def test_first_file(self, mock_socket):
        mock_conn = mock_socket.return_value
        file_content = files['729.txt']
        mock_conn.recv.side_effect = [
            f"file-name: 729.txt,\r\nfile-size: {len(file_content)}\r\n\r\n".encode(),
            file_content.encode(),
            b''
        ]

        conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        conn.connect(('localhost', 65432))

        conn.sendall('download 729.txt'.encode())

        header = conn.recv(1024).decode()

        if f"file-name: 729.txt,\r\nfile-size: {len(file_content)}\r\n\r\n" in header:
            print("test_first_file passed: Received correct header for '729.txt'.")
        else:
            print("test_first_file failed: Did not receive correct header for '729.txt'.")

        data = b''
        while True:
            part = conn.recv(1024)
            if not part:
                break
            data += part

        if data == file_content.encode():
            print("test_first_file passed: Received correct content for '729.txt'.")
        else:
            print("test_first_file failed: Did not receive correct content for '729.txt'.")

        conn.close()

    @patch('socket.socket')
    def test_second_file(self, mock_socket):
        mock_conn = mock_socket.return_value
        file_content = files['s41066-020-00226-2.pdf']
        mock_conn.recv.side_effect = [
            f"file-name: s41066-020-00226-2.pdf,\r\nfile-size: {len(file_content)}\r\n\r\n".encode(),
            file_content.encode(),
            b''
        ]

        conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        conn.connect(('localhost', 65432))

        conn.sendall('download s41066-020-00226-2.pdf'.encode())

        header = conn.recv(1024).decode()

        if f"file-name: s41066-020-00226-2.pdf,\r\nfile-size: {len(file_content)}\r\n\r\n" in header:
            print("test_second_file passed: Received correct header for 's41066-020-00226-2.pdf'.")
        else:
            print("test_second_file failed: Did not receive correct header for 's41066-020-00226-2.pdf'.")

        data = b''
        while True:
            part = conn.recv(1024)
            if not part:
                break
            data += part

        if data == file_content.encode():
            print("test_second_file passed: Received correct content for 's41066-020-00226-2.pdf'.")
        else:
            print("test_second_file failed: Did not receive correct content for 's41066-020-00226-2.pdf'.")

        conn.close()

    @patch('socket.socket')
    def test_third_file(self, mock_socket):
        mock_conn = mock_socket.return_value
        file_content = files['xlsx.zip']
        mock_conn.recv.side_effect = [
            f"file-name: xlsx.zip,\r\nfile-size: {len(file_content)}\r\n\r\n".encode(),
            file_content.encode(),
            b''
        ]

        conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        conn.connect(('localhost', 65432))

        conn.sendall('download xlsx.zip'.encode())

        header = conn.recv(1024).decode()

        if f"file-name: xlsx.zip,\r\nfile-size: {len(file_content)}\r\n\r\n" in header:
            print("test_third_file passed: Received correct header for 'xlsx.zip'.")
        else:
            print("test_third_file failed: Did not receive correct header for 'xlsx.zip'.")

        data = b''
        while True:
            part = conn.recv(1024)
            if not part:
                break
            data += part

        if data == file_content.encode():
            print("test_third_file passed: Received correct content for 'xlsx.zip'.")
        else:
            print("test_third_file failed: Did not receive correct content for 'xlsx.zip'.")

        conn.close()

    @patch('socket.socket')
    def test_attribute(self, mock_socket):
        server = Server("localhost", 65432)

        if server.host == "localhost" and server.port == 65432 and isinstance(server.socket, type(mock_socket.return_value)):
            print("test_attribute passed: Attributes are as expected.")
        else:
            print("test_attribute failed: Attributes did not match.")

    @patch('socket.socket')
    def test_attribute2(self, mock_socket):
        server = Server("localhost", 5000)

        if server.host == "localhost" and server.port == 5000 and isinstance(server.socket, type(mock_socket.return_value)):
            print("test_attribute2 passed: Attributes are as expected.")
        else:
            print("test_attribute2 failed: Attributes did not match.")

    @patch('socket.socket')
    def test_attribute3(self, mock_socket):
        server = Server("127.0.0.1", 65432)

        if server.host == "127.0.0.1" and server.port == 65432 and isinstance(server.socket, type(mock_socket.return_value)):
            print("test_attribute3 passed: Attributes are as expected.")
        else:
            print("test_attribute3 failed: Attributes did not match.")

    @patch('socket.socket')
    def test_attribute4(self, mock_socket):
        server = Server("127.0.0.1", 8000)

        if server.host == "127.0.0.1" and server.port == 8000 and isinstance(server.socket, type(mock_socket.return_value)):
            print("test_attribute4 passed: Attributes are as expected.")
        else:
            print("test_attribute4 failed: Attributes did not match.")
    

if __name__ == "__main__":
    # run server to test on your local computer
    # server = Server("localhost", 65432)
    # server.start()

    # run unit test
    # uncomment this before submitting to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
