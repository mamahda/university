import socket
import unittest
import sys
from io import StringIO
from unittest.mock import patch, MagicMock


class CustomFTP:
    def __init__(self, host='', user='', passwd='', timeout=60):
        self.host = host
        self.user = user
        self.passwd = passwd
        self.timeout = timeout
        self.sock = None
        self.file = None
        self.maxline = 8192

        if host:
            self.connect(host, timeout)

    def connect(self, host, timeout):
        self.sock = socket.create_connection((host, 21), timeout)
        self.file = self.sock.makefile('r', encoding='utf-8')
        self.getresp()

    def login(self, user='', passwd=''):
        if not user:
            user = self.user
        if not passwd:
            passwd = self.passwd

        self.sendcmd(f'USER {user}')
        if passwd:
            self.sendcmd(f'PASS {passwd}')

    def sendcmd(self, cmd):
        self.sock.sendall(cmd.encode('utf-8') + b'\r\n')
        return self.getresp()

    def putcmd(self, line):
        self.sock.sendall(line.encode('utf-8') + b'\r\n')

    def getresp(self):
        resp = self.getmultiline()
        return resp

    def getmultiline(self):
        line = self.getline()
        if line[3:4] == '-':
            code = line[:3]
            while True:
                nextline = self.getline()
                line += nextline
                if nextline[:3] == code and nextline[3:4] != '-':
                    break
        return line

    def getline(self):
        line = self.file.readline(self.maxline + 1)
        return line.rstrip('\r\n')

    def mkd(self, dirname):
        response = self.sendcmd(f'MKD {dirname}')
        print(response)

    def quit(self):
        self.sendcmd('QUIT')
        self.sock.close()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class CustomFTPTest(unittest.TestCase):
    @patch('socket.socket')
    def setUp(self, mock_socket):
        self.mock_socket = mock_socket
        self.ftp = CustomFTP('127.0.0.1', 'user', '123')
        self.ftp.sock = self.mock_socket.return_value
        self.ftp.file = MagicMock()
        self.ftp.mkd = MagicMock(return_value='257 "/new_directory" created successfully.')

    def tearDown(self):
        self.ftp.sock.close()

    def test_login(self):
        self.ftp.login('user', '123')
        self.mock_socket.return_value.sendall.assert_any_call(b'USER user\r\n')

        self.mock_socket.return_value.sendall.assert_any_call(b'PASS 123\r\n')
        print(f"login called with {self.mock_socket.return_value.sendall.call_args}")

    def test_mkd(self):
        response = self.ftp.mkd('new_directory')
        assert_equal(response, '257 "/new_directory" created successfully.')

        self.mock_socket.return_value.sendall.assert_called_with(b'MKD new_directory\r\n')
        print(f"mkd called with {self.mock_socket.return_value.sendall.call_args}")

    def test_quit(self):
        self.ftp.quit()
        self.mock_socket.return_value.sendall.assert_called_with(b'QUIT\r\n')
        print(f"quit called with {self.mock_socket.return_value.sendall.call_args}")

        self.mock_socket.return_value.close.assert_called_once()
        print(f"socket close called with {self.mock_socket.return_value.close.call_args}")


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        ftp = CustomFTP('localhost', 'user', '123')
        ftp.login()
        ftp.mkd('new_directory')
        ftp.quit()
    
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)

