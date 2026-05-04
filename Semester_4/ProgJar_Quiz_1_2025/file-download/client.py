import unittest 
from unittest.mock import patch, MagicMock
import os
import socket
import sys
from io import StringIO
BASE_DIR = os.path.dirname(os.path.realpath(__file__))


class Client:
    def __init__(self, host, port):
        # 1. Define host and port
        self.host = host
        self.port = port

        # 2. Create a socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def connect(self):
        # 3. Connect to the server
        print(f"Connecting to {self.host}:{self.port}")

        # connect command here
        self.socket.connect((self.host, self.port))

    def send_message(self, message):
        # 4. Send a message command to the server
        self.socket.send(message.encode())

        # 5. Receive a response from the server and return it
        return self.socket.recv(1024).decode()

    def recv(self, size):
        # 6. Receive data from the server and return it
        return self.socket.recv(size)

    def disconnect(self):
        # 7. Close the socket connection
        self.socket.close()

    def parse_header(self, header_content):
        # 8. Parse the header and content, and return the file name and size and content
        # split header and content based on given delimiter in the unit test or in the problem
        split_results = header_content.split('\r\n\r\n', 1)

        # get header from the split results
        header = split_results[0]

        # get content from the split results
        content = split_results[1]
        
        # get filename from the header (use split string)
        parts = header.split(',')
        filename = parts[0].split(': ')[1]

        # get filesize from the header (use split string)
        filesize = int(parts[1].split(': ')[1])
        
        return filename, filesize, content 

def start_client():
    # 1. Create a Client object
    client = Client("localhost", 65432)
    
    # 2. Connect to the server
    client.conect()

    # 3. Send a message to the server and receive a response
    message = input("Enter a message: ")

    # use send_message method from Client class
    status = client.send_message(message)
    print(status)

    # 4. Check if the response isn't a header
    # 4.1 If it is, print the response and exit
    if "\r\n" not in status:
        print(status)
        
        # close socket or disconnect
        client.disconnect()

        sys.exit(1)

    # 5. Parse the header
    # use parse_header method from Client class
    file_name, file_size, content = client.parse_header(status)

    # define file path: join base directory and file name
    file_path = os.path.join(BASE_DIR, file_name)

    # 6. Receive the file from the server and save it
    total_data = 0

    # use len() function to get content length
    content_length = len(content.encode())
        
    with open(file_path, 'wb') as f:
        # check content length
        # write to file if content length > 0
        if content_length > 0:
            total_data = content_length

            # write to file
            f.write(content.encode())

        while True:
            # check if total data equal to file size
            if total_data == file_size:
                break

            # continue receiving data
            read = client.recv(1024)

            # if total data equal to file size, break
            if total_data == file_size:
                # nothing is received means file is done
                print(f"{file_name} has been received successfully!")
                break
            
            # write to the file the bytes we just received
            f.write(read)
            total_data += len(read)

    # 7. Close the connection
    # use diconnect method from Client class 
    client.disconnect()

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestClient(unittest.TestCase):
    @patch('socket.socket')
    def test_connect(self, mock_socket_class):
        print('Testing connect to server ...')
        client = Client('localhost', 65432)
        client.connect()
        mock_socket_instance = mock_socket_class.return_value
        mock_socket_instance.connect.assert_called_with(('localhost', 65432))
        print(f"connect called with: {mock_socket_instance.connect.call_args}")
        print()

    @patch('socket.socket')
    def test_send_message(self, mock_socket_class):
        print('Testing send message ...')
        mock_socket_instance = mock_socket_class.return_value
        mock_socket_instance.recv.return_value = b'ok'
        client = Client('localhost', 65432)
        response = client.send_message('Hello')
        mock_socket_instance.send.assert_called_with(b'Hello')
        print(f"send called with: {mock_socket_instance.send.call_args}")
        self.assertEqual(response, 'ok')

    @patch('socket.socket')
    def test_recv(self, mock_socket_class):
        print('Testing receive message ...')
        mock_socket_instance = mock_socket_class.return_value
        mock_socket_instance.recv.return_value = b'data'
        print(f"recv return value: {mock_socket_instance.recv.return_value}")
        
        client = Client('localhost', 65432)
        data = client.recv(1024)
        self.assertEqual(data, b'data')
        print(f"recv called with: {mock_socket_instance.recv.call_args}")
        print()
    
    @patch('socket.socket')
    def test_disconnect(self, mock_socket_class):
        print('Testing disconnect ...')
        client = Client('localhost', 65432)
        client.disconnect()
        mock_socket_instance = mock_socket_class.return_value
        mock_socket_instance.close.assert_called()
        print(f"close called with: {mock_socket_instance.close.call_args}")
        print()

    def test_parse_header(self):
        print('Testing parse header ...')
        client = Client('localhost', 65432)
        header_content = "file-name: example.txt,file-size: 1024\r\n\r\ntest content"
        filename, filesize, content = client.parse_header(header_content)
        self.assertEqual(filename, 'example.txt')
        self.assertEqual(filesize, 1024)
        self.assertEqual(content, 'test content')

        assert_equal(filename, 'example.txt')
        assert_equal(filesize, 1024)
        assert_equal(content, 'test content')
        print()

        client.disconnect()
    
    @patch('socket.socket')
    def test_attribute1(self, mock_socket):
        client = Client("localhost", 65432)
        assert_equal(client.host, "localhost")
        assert_equal(client.port, 65432)

    @patch('socket.socket')
    def test_attribute2(self, mock_socket):
        client = Client("127.0.0.1", 65432)
        assert_equal(client.host, "127.0.0.1")
        assert_equal(client.port, 65432)

    @patch('socket.socket')
    def test_attribute3(self, mock_socket):
        client = Client("localhost", 5000)
        assert_equal(client.host, "localhost")
        assert_equal(client.port, 5000)

    @patch('socket.socket')
    def test_attribute4(self, mock_socket):
        client = Client("127.0.0.1", 5000)
        assert_equal(client.host, "127.0.0.1")
        assert_equal(client.port, 5000)
        print()


if __name__ == '__main__':
    # run unit test
    # uncomment this before submitting the code to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    # Uncomment this if you want to run the client program, not running the unit test
    # start_client()
