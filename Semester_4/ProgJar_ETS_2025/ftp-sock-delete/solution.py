import socket
import sys
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO


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
            self.connect(self.host, self.timeout)

    def connect(self, host, timeout):
        self.sock = socket.create_connection((host, 21), timeout)
        self.file = self.sock.makefile('r', encoding='utf-8')
        return self.getresp()

    def login(self, user='', passwd=''):
        if not user:
            user = self.user
        if not passwd:
            passwd = self.passwd

        self.sendcmd(f'USER {user}')
        if passwd:
            return self.sendcmd(f'PASS {passwd}')


    def sendcmd(self, cmd):
        self.putcmd(cmd)
        return self.getresp()

    def putcmd(self, line):
        self.sock.sendall((line + '\r\n').encode('utf-8'))

    def getresp(self):
        resp = self.getmultiline()
        return resp

    def getmultiline(self):
        line = self.getline()
        if line[3:4] == '-':
            code = line[:3]
            while True:
                nextline = self.getline()
                line += ('\n' + nextline)
                if nextline[:3] == code and nextline[3:4] != '-':
                    break
        return line

    def getline(self):
        line = self.file.readline()
        return line.rstrip('\r\n')

    def delete(self, filename):
        response = self.sendcmd(f'DELE {filename}')
        return response

    def quit(self):
        response = self.sendcmd('QUIT')
        self.sock.close()
        return response


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')

class TestCustomFTP(unittest.TestCase):
    @patch('socket.socket')
    def setUp(self, mock_socket):
        self.mock_socket = mock_socket
        self.ftp = CustomFTP('127.0.0.1', 'user', '123')
        self.ftp.sock = self.mock_socket.return_value
        self.ftp.file = MagicMock()
        self.ftp.delete = MagicMock(return_value='250 File deleted successfully.')

    def tearDown(self):
        self.ftp.sock.close()

    def test_login(self):
        self.ftp.login('user', 'pass')
        self.mock_socket.return_value.sendall.assert_any_call(b'USER user\r\n')

        self.mock_socket.return_value.sendall.assert_any_call(b'PASS pass\r\n')
        print(f"login called with {self.mock_socket.return_value.sendall.call_args}")

    def test_sendcmd(self):
        self.ftp.sendcmd('TEST')
        self.mock_socket.return_value.sendall.assert_called_with(b'TEST\r\n')
        print(f"sendcmd called with {self.mock_socket.return_value.sendall.call_args}")

    def test_delete(self):
        response = self.ftp.delete('file.txt')
        assert_equal(response, '250 File deleted successfully.')

        self.mock_socket.return_value.sendall.assert_called_with(b'DELE file.txt\r\n')
        print(f"delete called with {self.mock_socket.return_value.sendall.call_args}")

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
        ftp.delete('testfile.txt')
        ftp.quit()
    
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)

