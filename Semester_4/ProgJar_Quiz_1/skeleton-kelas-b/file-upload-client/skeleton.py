import ?
from unittest.mock import patch, MagicMock
import ? 
import ?
import ?
from io import StringIO


BASE_DIR = os.path.dirname(os.path.realpath(__file__))
files = {
    "729.txt": "Content of 729.txt",
    "s41066-020-00226-2.pdf": "Content of s41066-020-00226-2.pdf",
    "xlsx.zip": "Content of xlsx.zip"
}


class Client:
    def __init__(self, host, port):
        # 1. Define host and port
        # 2. Create a socket
        self.host = ?
        self.port = ?
        self.socket = ?
    
    def connect(self):
        # 3. Connect to the server
        print(f"Connecting to {?}:{?}")
        ?
    
    def send_message(self, message):
        # 4. Send a message to the server
        # 5. Receive a response from the server and return it
        ?
        return ?
    
    def sendall(self, data):
        # 6. socket sendall 
        ?

    def disconnect(self):
        # 7. Close the connection
        ?


def start_client():
    # 1. Create a Client object
    client = ?
    # 2. Connect to the server
    ?

    # 3. Send a message to the server and receive a response
    message = input("Enter a message: ")

    # check for valid command
    if ? != 'upload':
        print('Unknown command. The correct command is: upload file_name')
        # sys exit 1
        ?

    else:
        # send message (use send_message method)
        status = ?

        # get filename from message
        filename = ?
        print(status)

        # Send the header to the client
        # get file content
        file_content = ?

        # get content size
        filesize = ?

        # make header, please refer to unit test for header format
        header = ?

        # Send BOTH the header AND file content to the client
        client.?

        # close socket
        ?


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
    def test_init(self, mock_socket):
        print('Testing attribute ...')
        host, port = 'localhost', 65432
        client = Client(host, port)
        mock_socket.assert_called_with(socket.AF_INET, socket.SOCK_STREAM)
        assert_equal(client.host, host)
        assert_equal(client.port, port)
        print()

    @patch('socket.socket')
    def test_connect(self, mock_socket):
        print('Testing connect to server ...')
        client = Client('localhost', 65432)
        client.connect()
        mock_socket.return_value.connect.assert_called_with(('localhost', 65432))
        print(f"connect called with: {mock_socket.return_value.connect.call_args}")
        print()

    @patch('socket.socket')
    def test_send_message(self, mock_socket):
        print('Testing send message ...')
        mock_socket_instance = mock_socket.return_value
        mock_socket_instance.recv.return_value = b'OK'
        client = Client('localhost', 65432)
        response = client.send_message('Hello')
        
        assert_equal(response, 'OK')
        mock_socket_instance.send.assert_called_with(b'Hello')
        print(f"send called with: {mock_socket_instance.send.call_args}")
        mock_socket_instance.recv.assert_called_with(1024)
        print(f"recv called with: {mock_socket_instance.recv.call_args}")
        print()

    @patch('socket.socket')
    def test_disconnect(self, mock_socket):
        print('Testing disconnect ...')
        client = Client('localhost', 65432)
        client.disconnect()
        mock_socket.return_value.close.assert_called()
        print(f"close called with: {mock_socket.return_value.close.call_args}")
        print()

    @patch('builtins.input', return_value='upload 729.txt')
    @patch('socket.socket')
    def test_start_client(self, mock_socket, mock_input):
        print('Testing start client ...')
        client_socket_instance = mock_socket.return_value
        client_socket_instance.recv.return_value = b'OK'
        start_client()
        calls = [call.encode() for call in [
            'upload 729.txt',
            
        ]]
        client_socket_instance.send.assert_called_with(calls[0])
        print(f"send called with: {client_socket_instance.send.call_args}")
        client_socket_instance.recv.assert_called_with(1024)
        print(f"recv called with: {client_socket_instance.recv.call_args}")
        self.assertTrue(mock_input.called)
        print()
    
    @patch('sys.exit')
    @patch('builtins.input', return_value='unknown command')
    def test_unknown_command(self, mock_input, mock_exit):
        """
        Test that an unknown command results in the correct print statement and sys.exit(1).
        """
        print('Testing unknown command ...')
        start_client()

        mock_input.assert_called_once()

        # Check that sys.exit(1) was called
        mock_exit.assert_called_once_with(1)
        print()

        # Check that the correct message was printed
        # mock_print.assert_any_call('Unknown command. The correct command is: upload file_name')


    @patch('builtins.input', return_value='upload non_existent_file.txt')
    @patch('socket.socket')
    def test_unknown_file_name(self, mock_socket, mock_input):
        """
        Test uploading a file that does not exist in the predefined files dictionary.
        """
        print('Testing unknown file name ...')
        client_socket_instance = mock_socket.return_value
        client_socket_instance.recv.return_value = b'OK'
        with self.assertRaises(KeyError):
            # Expecting a KeyError because the file does not exist in the files dictionary
            start_client()
        mock_input.assert_called_once()
        print()

    @patch('builtins.input', return_value='upload 729.txt')
    @patch('socket.socket')
    def test_upload_correct_file(self, mock_socket, mock_input):
        """
        Test correctly uploading a file that exists in the predefined files dictionary.
        """
        print('Testing correct file name ...')
        client_socket_instance = mock_socket.return_value
        client_socket_instance.recv.side_effect = [b'OK', b'File received']
        start_client()
        mock_input.assert_called_once()
        # Verify that sendall was called with the expected header and file content
        header = f"file-name: 729.txt,\r\nfile-size: {len(files['729.txt'])}\r\n\r\n".encode()
        file_content = files['729.txt'].encode()
        client_socket_instance.sendall.assert_called_with(header + file_content)
        print(f"sendall called with: {client_socket_instance.sendall.call_args}")


if __name__ == "__main__":
    # uncomment this to test the client code in your local computer
    # start_client()

    # uncomment this before submitting to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
