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
        self.encoding = 'utf-8'

        if host:
            self.connect(host, timeout)

    def connect(self, host, timeout):
        self.sock = socket.create_connection((host, 21), timeout)
        self.file = self.sock.makefile('r', encoding=self.encoding)
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
        self.putcmd(cmd)
        return self.getresp()

    def putcmd(self, line):
        self.sock.sendall(line.encode(self.encoding) + b'\r\n')

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
        line = self.file.readline(self.maxline + 1)
        return line.rstrip('\r\n')

    def pwd(self):
        return self.sendcmd('PWD')

    def quit(self):
        self.sendcmd('QUIT')
        # close
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


class TestCustomFTP(unittest.TestCase):

    @patch('socket.create_connection')
    def test_connect(self, mock_create_connection):
        mock_sock = MagicMock()
        mock_create_connection.return_value = mock_sock
        
        ftp = CustomFTP()
        ftp.connect('testhost', 30)
        
        mock_create_connection.assert_called_once_with(('testhost', 21), 30)
        self.assertEqual(ftp.sock, mock_sock)
        print(f"create connection called with: {mock_create_connection.call_args_list}")
        self.assertIsNotNone(ftp.file)

    @patch.object(CustomFTP, 'sendcmd')
    def test_login(self, mock_sendcmd):
        ftp = CustomFTP()
        ftp.sock = MagicMock()
        ftp.file = MagicMock()
        
        ftp.login('testuser', 'testpass')
        
        mock_sendcmd.assert_any_call('USER testuser')
        mock_sendcmd.assert_any_call('PASS testpass')
        print(f"sendcmd called with: {mock_sendcmd.call_args_list}")

    @patch.object(CustomFTP, 'getresp')
    def test_sendcmd(self, mock_getresp):
        ftp = CustomFTP()
        ftp.sock = MagicMock()
        ftp.file = MagicMock()
        
        mock_getresp.return_value = 'testresponse'
        
        response = ftp.sendcmd('TESTCMD')
        
        ftp.sock.sendall.assert_called_once_with(b'TESTCMD\r\n')
        assert_equal(response, 'testresponse')

    def test_putcmd(self):
        ftp = CustomFTP()
        ftp.sock = MagicMock()
        
        ftp.putcmd('TESTCMD')
        
        ftp.sock.sendall.assert_called_once_with(b'TESTCMD\r\n')
        print(f"sendall called with: {ftp.sock.sendall.call_args_list}")

    @patch.object(CustomFTP, 'getline')
    def test_getmultiline(self, mock_getline):
        ftp = CustomFTP()
        ftp.sock = MagicMock()
        ftp.file = MagicMock()
        
        mock_getline.side_effect = ['220-Welcome', '220- To FTP Server', '220 User logged in']
        
        response = ftp.getmultiline()
        
        assert_equal(response, '220-Welcome\n220- To FTP Server\n220 User logged in')

    @patch('socket.create_connection')
    @patch.object(CustomFTP, 'getresp')
    def test_pwd(self, mock_getresp, mock_create_connection):
        mock_sock = MagicMock()
        mock_create_connection.return_value = mock_sock
        mock_getresp.return_value = '/home/testuser'
        
        ftp = CustomFTP('testhost')
        ftp.sock = mock_sock
        ftp.file = MagicMock()
        
        response = ftp.pwd()
        
        assert_equal(response, '/home/testuser')
        ftp.sock.sendall.assert_called_once_with(b'PWD\r\n')
        print(f"sendall called with: {ftp.sock.sendall.call_args_list}")

    @patch('socket.create_connection')
    @patch.object(CustomFTP, 'sendcmd')
    def test_quit(self, mock_sendcmd, mock_create_connection):
        mock_sock = MagicMock()
        mock_create_connection.return_value = mock_sock
        
        ftp = CustomFTP('testhost')
        ftp.sock = mock_sock
        ftp.file = MagicMock()
        
        ftp.quit()
        
        mock_sendcmd.assert_called_once_with('QUIT')
        print(f"sendcmd called with: {mock_sendcmd.call_args_list}")
        mock_sock.close.assert_called_once()
        print(f"close called with: {mock_sock.close.call_args_list}")


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        # Example usage
        ftp = CustomFTP('ftp.dlptest.com')
        ftp.login()
        print(ftp.pwd())
        ftp.quit()
    
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
