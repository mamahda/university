import ? 
import ? 
import ?
from io import StringIO
from unittest.mock import MagicMock, patch

# define host and port
HOST = ?
PORT = ?

def receive_message(client_socket):
    try:
        # receive message
        message = ?

        # if no message, then return False
        if not len(?):
            return False
        
        # if there is a message, then return the message
        return ?
    except:
        return False

def broadcast(message, sender_socket, clients):
    # check each socket in list of client sockets
    for ? in clients:
        # if socket is not sender socket, then send the message
        # if socket is the sender socket, then we do not send
        if ? != sender_socket:
            ?.send(?)

def start_server():
    # create socket
    server_socket = ?

    # set socket option to reuse address
    server_socket.?

    # bind address to server socket
    ?

    # listen
    ?

    # initiate socket list, first element is the server socket
    sockets_list = ?
    clients = {}

    print(f'Listening for connections on {?}:{?}...')

    while True:
        # use select to serve many clients
        read_sockets, _, _ = ?

        # check for each read-ready socket
        for ? in ?:
            # if the ready socket is the server socket, then accept connection
            if ? == ?:
                # accept connection
                client_socket, client_address = ?

                # receive message from client socket
                # use receive_message function
                user = ?
                if user is False:
                    continue

                # append client socket to sockets_list
                ?

                # add client socket and user to the clients dictionary
                # key: client_socket, value: user
                clients?
                print('Accepted new connection from {}:{}, nickname: {}'.format(*client_address, ?))    # nickname == user
            else:
                # receive message from read-ready socket
                message = receive_message(?)

                # check if message is False
                if ? is False:
                    print('Closed connection from: {}'.format(clients[?].decode('utf-8')))

                    # remove read ready socket from sockets_list
                    sockets_list.?

                    # delete read ready socket from clients dictionary
                    del ?
                    continue

                # get user data from the clients dictionary based on the socket 
                user = clients[?]

                # fill in the question mark in the following order: user and message. 
                # do not forget to decode the string
                print(f'Received message from {?}: {?}')
                
                # Broadcast message with nickname prefixed
                # full message in the following order: user and message
                # do not forget to decode the string
                # in the end of full_message, encode to bytes because we need to send it via socket
                full_message = f"{?}: {?}".?

                # first argument = full_message
                # second argument = the socket ready
                # third argument = clients dictionary
                broadcast(?, ?, ?)


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_true(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')

def assert_false(parameter1):
    if parameter1 == False:
        print(f'{parameter1} is False')
    else:
        print(f'{parameter1} is True')

class TestChatServer(unittest.TestCase):

    @patch('socket.socket')
    def setUp(self, mock_socket):
        self.mock_socket = MagicMock()
        self.mock_client_socket = MagicMock()
        mock_socket.return_value = self.mock_socket

    def test_receive_message_successful(self):
        """Test receiving a message successfully."""
        print('Testing receive message successful ...')

        expected_message = b'Hello, World!'
        self.mock_client_socket.recv.return_value = expected_message
        print(f"recv return value: {self.mock_client_socket.recv.return_value}")

        # Assuming receive_message is a function that takes a socket and returns a message
        message = receive_message(self.mock_client_socket)
        assert_true(message, expected_message)
    
    def test_receive_message_empty(self):
        """Test receiving an empty message, indicating disconnection."""
        print('Testing receive message empty ...')
        self.mock_client_socket.recv.return_value = b''

        message = receive_message(self.mock_client_socket)
        # self.assertFalse(message)
        assert_false(message)
        print()
    
    def test_receive_message_exception(self):
        """Test handling an exception, indicating an error during receiving."""
        print('Testing receive message exception ...')

        self.mock_client_socket.recv.side_effect = socket.error

        message = receive_message(self.mock_client_socket)
        # self.assertFalse(message)
        assert_false(message)
        print()

    @patch('socket.socket')
    def test_broadcast(self, mock_socket):
        print('Testing broadcast ...')
        # Setup
        # Simulate three client sockets
        mock_sender_socket = MagicMock()
        mock_receiver_socket1 = MagicMock()
        mock_receiver_socket2 = MagicMock()

        # Group them as if they are in the server's list of connected sockets
        clients = {
            mock_sender_socket: 'sender',
            mock_receiver_socket1: 'receiver1',
            mock_receiver_socket2: 'receiver2'
        }

        # Define a test message to broadcast
        test_message = b"Hello, Group!"

        # Action
        # Attempt to broadcast the message from the sender to the other clients
        broadcast(test_message, mock_sender_socket, clients)

        # Assertions
        # Ensure the message was sent to all other clients, but not to the sender
        mock_sender_socket.send.assert_not_called()  # The sender should not receive its own message
        mock_receiver_socket1.send.assert_called_once_with(test_message)
        print(f"send receiver 1 called with: {mock_receiver_socket1.send.call_args}")

        mock_receiver_socket2.send.assert_called_once_with(test_message)
        print(f"send receiver 2 called with: {mock_receiver_socket2.send.call_args}")
        print()
    
    @patch('socket.socket')
    @patch('select.select')
    def test_accept_new_connection(self, mock_select, mock_socket):
        print('Testing accept new connection ...')
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        mock_socket.return_value = mock_server_socket
        
        # Use a function to dynamically handle calls to select.select
        def select_side_effect(*args, **kwargs):
            if select_side_effect.call_count == 0:
                select_side_effect.call_count += 1
                return ([mock_server_socket], [], [])  # Simulate an incoming connection
            else:
                raise KeyboardInterrupt  # Simulate a signal to stop the server (or use another appropriate exception)

        select_side_effect.call_count = 0
        mock_select.side_effect = select_side_effect

        mock_server_socket.accept.return_value = (mock_client_socket, ('127.0.0.1', 12345))
        mock_client_message = b"TestUser"
        mock_client_socket.recv.return_value = mock_client_message

        # Assuming your server has a way to cleanly exit, simulate or invoke that here.
        # This example uses KeyboardInterrupt, but adjust based on your server's design.
        try:
            start_server()
        except KeyboardInterrupt:
            pass

        mock_server_socket.bind.assert_called_with(('127.0.0.1', 65432))
        print(f"bind called with: {mock_server_socket.bind.call_args}")

        mock_server_socket.listen.assert_called()
        print(f"listen called with: {mock_server_socket.listen.call_args}")

        mock_server_socket.accept.assert_called()
        print(f"accept called with: {mock_server_socket.accept.call_args}")

        mock_client_socket.recv.assert_called_with(1024)
        print(f"recv called with: {mock_client_socket.recv.call_args}")
        print()


if __name__ == "__main__":
    # uncomment this to test the communication between server and client on your local computer
    # start_server()

    # uncomment this before submitting to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
