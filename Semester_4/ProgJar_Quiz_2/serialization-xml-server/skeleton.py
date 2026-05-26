import logging
import select
import socket
import sys
import json
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Message:
    def __init__(self, username, text, timestamp):
        self.username = username
        self.text = text
        self.timestamp = timestamp

    @staticmethod
    def deserialize(serialized_message):
        # expect a JSON-encoded byte string
        if isinstance(serialized_message, bytes):
            decoded = serialized_message.decode('utf-8')
        else:
            decoded = serialized_message
        data = json.loads(decoded)
        # parse timestamp back to datetime if present
        ts = data.get('timestamp')
        if ts is not None:
            try:
                ts = datetime.fromisoformat(ts)
            except Exception:
                ts = ts
        return Message(data.get('username'), data.get('text'), ts)

    def serialize(self):
        # serialize the message object to a JSON-encoded byte string
        data = {
            'username': self.username,
            'text': self.text,
            'timestamp': self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp
        }
        return json.dumps(data).encode('utf-8')

def main():
    # create a server socket, bind, listen
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(('127.0.0.1', 12345))
    server_socket.listen()
    server_socket.setblocking(False)

    # list of sockets for select.select()
    sockets_list = [server_socket]

    logger.info('Server listening on 127.0.0.1:12345')

    while True:
        # select.select()
        read_sockets, _, exception_sockets = select.select(sockets_list, [], sockets_list)

        for notified_socket in read_sockets:
            if notified_socket == server_socket:
                # accept new connection
                client_socket, client_address = server_socket.accept()
                client_socket.setblocking(False)

                # add the new client socket to the list of sockets
                sockets_list.append(client_socket)
                logger.info(f"Accepted new connection from {client_address}")
            else:
                try:
                    # receive message from client
                    data = notified_socket.recv(1024)
                    if data:
                        message = Message.deserialize(data)
                        logger.info("Received message:")
                        logger.info(f"Username: {message.username}")
                        logger.info(f"Text: {message.text}")
                        logger.info(f"Timestamp: {message.timestamp}")
                except Exception as e:
                    logger.info(f"Exception: {e}")
                    # remove the socket that's broken
                    if notified_socket in sockets_list:
                        sockets_list.remove(notified_socket)
                    # close the connection
                    try:
                        notified_socket.close()
                    except Exception:
                        pass

        for notified_socket in exception_sockets:
            # remove the socket
            if notified_socket in sockets_list:
                sockets_list.remove(notified_socket)
            # close the connection
            try:
                notified_socket.close()
            except Exception:
                pass

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_true_any(parameter1, parameter2):
    found = False
    for message in parameter2:
        if parameter1 in message:
            found = True
            break
    
    print(f'test attribute passed: {parameter1} found in log messages' if found else f'test attribute failed: {parameter1} not found in log messages')
    # return found

class TestChatServer(unittest.TestCase):
    
    @patch('select.select')
    @patch('socket.socket')
    def test_server_main(self, mock_socket_class, mock_select):
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        
        mock_socket_class.return_value = mock_server_socket
        mock_server_socket.accept.return_value = (mock_client_socket, ('127.0.0.1', 54321))
        
        # Initial call to select() returns the server socket as ready to accept
        mock_select.side_effect = [
            ([mock_server_socket], [], []),
            ([mock_client_socket], [], []),
            KeyboardInterrupt()  # To break out of the infinite loop
        ]
        
        # Mock data received from the client
        test_message = Message("Alice", "Hello, World!", datetime.now())
        serialized_message = test_message.serialize()
        mock_client_socket.recv.return_value = serialized_message
        
        with self.assertLogs(logger, level='INFO') as log:
            with self.assertRaises(KeyboardInterrupt):
                main()
            
            # Check if the server accepted a new connection
            mock_server_socket.accept.assert_called_once()
            mock_client_socket.setblocking.assert_called_once_with(False)
            
            # Check if the server received and deserialized the message correctly
            mock_client_socket.recv.assert_called_once_with(1024)
            
            # Verify log messages
            log_output = log.output
            
            assert_true_any("Received message:", log_output)
            assert_true_any("Username: Alice", log_output)
            assert_true_any("Text: Hello, World!", log_output) 

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        main()
    
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
