import ?
import ?
import ? 
import ?
import ?
from unittest.mock import patch, MagicMock
from io import StringIO

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
BUFFER_SIZE = ?

class Server:
    def __init__(self, host="?", port=?):
        # define host and port
        self.host = ?
        self.port = ?

        # create socket
        self.server_socket = ?

        # set socket option for reuse address
        ?

        # bind socket
        ?

        # listen
        ?

        # list for select
        # the first element is the server socket
        self.input_socket = ?
    
    def parse_header(self, header_content):
        # Parse the header and return the file name, size, and content
        ?
        header = ?
        content = ?
        
        filename = ?
        filesize = ?
        
        return filename, filesize, content 
    
    def receive_file(self, first_chunk, file_path, file_size, sock):
        # Receive the file from the server and save it
        total_received = ?
        content_length = ?
            
        with open(file_path, 'wb') as f:
            # check content length
            # write to file if content length > 0
            if ?:
                # initiate total received data with first content length
                total_received = ?

                # write first chunk of data to file
                ?

            # Receive and save the file
            # while total recived data is less than file size
            while ? < ?:
                # receive data
                # use min(BUFFER_SIZE, file_size - total_received) if necessary
                chunk = ?
                if not chunk:
                    break

                # write chunk to file
                ?

                # total received is equal to total received plus chunk length
                ?
            
            print(f"[+] File {file_path} received successfully!")

            # Send confirmation to the client
            sock.?
    
    def start(self):
        print(f"[+] Listening from {self.host}:{self.port}")
        try:
            while True:
                # use select technique
                read_ready, _, _ = ?
                
                for ? in read_ready:
                    # if socket ready is the server socket
                    if ? == ?:
                        # accept connection
                        client_socket, client_address = ?
                        print(f"[+] New client {?} is connected.")

                        # append client socket to list for select
                        ?
                    else:
                        try:
                            # Receive command and filename from client
                            data = ?
                        except ConnectionResetError:
                            # close socket
                            ?

                            # remove socket from list for select
                            ?
                            break

                        # get command and filename, use split string
                        command, filename = ?
                        print(command, filename)

                        if command != "upload":
                            # send 'Unknown command'
                            ?
                            continue
                        
                        elif command == 'upload':
                            # Send acknowledgement to start receiving file
                            # send 'Ready to receive file'
                            ?

                            # receive data again
                            ?

                            # parse header, use parse_header method
                            file_name, file_size, content = ?
                            file_path = ?

                            # receive_file
                            self.receive_file(?, ?, ?, ?)


        except KeyboardInterrupt:
            # close server socket
            ?

            # sys exit 0
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


class TestServer(unittest.TestCase):
    @patch('socket.socket')
    def setUp(self, mock_socket):
        self.host = "127.0.0.1"
        self.port = 65432
        self.server = Server(self.host, self.port)

    def test_parse_header(self):
        print('Testing parse header ...')
        header_content = "file-name: testfile.txt,\r\nfile-size: 1024\r\n\r\nContent"
        filename, filesize, content = self.server.parse_header(header_content)
        
        assert_equal(filename, "testfile.txt")
        assert_equal(filesize, 1024)
        assert_equal(content, "Content")
        print()

    @patch('builtins.open', new_callable=unittest.mock.mock_open)
    @patch('socket.socket')
    def test_receive_file(self, mock_socket, mock_open):
        print('Testing receive file ...')
        mock_sock_instance = MagicMock()
        mock_sock_instance.recv = MagicMock(side_effect=[b"More content", b""])
        
        first_chunk = "Initial content"
        file_path = "/fakepath/testfile.txt"
        file_size = len(first_chunk) + len("More content")
        
        self.server.receive_file(first_chunk, file_path, file_size, mock_sock_instance)

        # Check if file write was called correctly
        mock_open.assert_called_once_with(file_path, 'wb')
        handle = mock_open()
        handle.write.assert_any_call(first_chunk.encode())
        handle.write.assert_any_call(b"More content")

        # Check if the file received confirmation is sent
        mock_sock_instance.sendall.assert_called_with(b"File received successfully")
        print(f"sendall called with: {mock_sock_instance.sendall.call_args}")
        print()

    def test_start(self):
        print('Testing start ...')
        with patch('select.select') as mock_select, \
             patch.object(Server, 'receive_file') as mock_receive_file, \
             patch('socket.socket') as mock_socket:
            # Mock select to immediately return a socket ready to read
            mock_socket_instance = mock_socket.return_value
            mock_socket_instance.accept.return_value = (mock_socket_instance, ('127.0.0.1', 12345))
            mock_select.return_value = ([mock_socket_instance], [], [])
            
            # Simulate receiving "upload command" and then interrupt to stop the loop
            mock_socket_instance.recv.side_effect = [
                b"upload testfile.txt",
                b"file-name: testfile.txt,\r\nfile-size: 1024\r\n\r\nContent",
                KeyboardInterrupt
            ]

            with self.assertRaises(SystemExit):
                self.server.start()

            mock_receive_file.assert_called()
            # print()
            

if __name__ == "__main__":
    # uncomment this to test the client code in your local computer
    # server = Server()
    # server.start()

    # uncomment this before submitting to domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
