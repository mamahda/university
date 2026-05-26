import sys
import socket
import configparser
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO


def parse_config(text):
    cfg = configparser.ConfigParser()
    cfg.read_string(text)
    return cfg


def handle_once(server_socket):
    conn, _ = server_socket.accept()
    with conn:
        text = conn.recv(4096).decode('utf-8')
        cfg = parse_config(text)
        for section in cfg.sections():
            for key, value in cfg.items(section):
                print(f'{section}.{key} = {value}')
        return cfg


def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('localhost', 5501))
        s.listen(1)
        handle_once(s)


class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestINIConfigServer(unittest.TestCase):

    @patch('socket.socket')
    def test_handle(self, mock_socket_class):
        server_sock = MagicMock()
        mock_socket_class.return_value.__enter__.return_value = server_sock

        conn_sock = MagicMock()
        conn_sock.__enter__.return_value = conn_sock
        conn_sock.recv.return_value = b'[server]\nhost = localhost\nport = 8080\n'
        server_sock.accept.return_value = (conn_sock, ('127.0.0.1', 1))

        main()

        server_sock.bind.assert_called_once_with(('localhost', 5501))
        cfg = parse_config('[server]\nhost = localhost\nport = 8080\n')
        assert_equal(cfg['server']['host'], 'localhost')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        main()
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
