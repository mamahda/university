# client.py
 
import socket
import select
import sys
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock

class ChatClient:
    def __init__(self, nickname, host='127.0.0.1', port=65432):
        # define host and port
        self.host = host
        self.port = port

        # create socket
        self.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # do not forget to encode nickname
        self.nickname = nickname.encode()

    def connect(self):
        # connect to server
        self.client_socket.connect((self.host, self.port))

        # set blocking to False
        self.client_socket.setblocking(False)

        # send nickname
        self.client_socket.send(self.nickname)

    def main_loop(self):
        while True:
            self.loop_iteration()

    def loop_iteration(self):
        # second element of the sockets_list is the client_socket
        sockets_list = [sys.stdin, self.client_socket]

        # use select to check which one is read ready: stdin or client socket
        read_sockets, _, _ = select.select(sockets_list, [], [])

        # check for read-ready socket
        for sock in read_sockets:
            # if the read-ready socket is the client socket
            if sock == self.client_socket:
                # receive message
                message = sock.recv(1024).decode()

                # write message to stdout
                sys.stdout.write(message)
            else:
                # read message from readline
                message = sys.stdin.readline()

                # send message
                self.client_socket.send(message.encode())

                # flush the stdout
                sys.stdout.flush()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_true(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestChatClient(unittest.TestCase):
    @patch('builtins.input', return_value='TestNickname')
    @patch('socket.socket')
    def setUp(self, mock_socket, mock_input):
        # Setup a ChatClient instance for each test
        # Input and socket are mocked, so no real network activity or user input occurs
        self.mock_socket_instance = MagicMock()
        mock_socket.return_value = self.mock_socket_instance

        # Instantiating ChatClient with mocked input and socket
        self.chat_client = ChatClient('TestNickname')
    
    def test_connect(self):
        # This method will test the connect functionality
        print('Testing connect to server ...')
        self.chat_client.connect()

        # Verify that socket's connect and send methods were called with the correct parameters
        self.mock_socket_instance.connect.assert_called_once_with((self.chat_client.host, self.chat_client.port))
        print(f"connect called with: {self.mock_socket_instance.connect.call_args}")

        self.mock_socket_instance.send.assert_called_once_with(self.chat_client.nickname)
        print(f"send called with: {self.mock_socket_instance.send.call_args}")
        print()
    
    def test_default_host_and_port(self):
        """Test the default host and port values."""
        print('Testing nickname, host, and port ...')
        client = ChatClient(nickname='testuser', host='127.0.0.1', port=65432)

        # self.assertEqual(client.host, '127.0.0.1')
        assert_true(client.host, '127.0.0.1')
        assert_true(client.port, 65432)
        assert_true(client.nickname, b'testuser')
        print()

    @patch('select.select')
    def test_loop_iteration_receive_message(self, mock_select):
        print('Testing receive message ...')

        # Prepare the mock objects for receiving a message
        self.mock_socket_instance.recv.return_value = b"Hello, World!\n"
        print(f"recv return value: {self.mock_socket_instance.recv.return_value}")

        mock_select.return_value = ([self.chat_client.client_socket], [], [])

        # Use a with statement to limit the scope of the sys.stdout patch
        with patch('sys.stdout', new_callable=MagicMock) as mock_stdout:
            # Run a single iteration of the main loop inside the with block
            self.chat_client.loop_iteration()

            # Verify that the message was printed to stdout
            mock_stdout.write.assert_called_once_with('Hello, World!\n')

        # Outside the with block, sys.stdout is unpatched, so print works normally
        print(f"write called with: {mock_stdout.write.call_args}")
        print()

    @patch('select.select')
    @patch('sys.stdin', new=MagicMock())
    def test_loop_iteration_send_message(self, mock_select):
        print('Testing send message ...')

        # Simulate user input
        sys.stdin.readline.return_value = "Hi there!"
        print(f"readline return value: {sys.stdin.readline.return_value}")

        mock_select.return_value = ([sys.stdin], [], [])

        # Run a single iteration of the main loop to simulate sending a message
        self.chat_client.loop_iteration()

        # Verify that the message was sent through the socket
        self.mock_socket_instance.send.assert_called_with(b'Hi there!')
        print(f"send called with: {self.mock_socket_instance.send.call_args}")


if __name__ == "__main__":
    # uncomment this to test communication between client and server on your local computer
    # nickname = input("Choose your nickname: ")
    # client = ChatClient(nickname)
    # client.connect()
    # client.main_loop()

    # uncomment this before submitting to dumjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
