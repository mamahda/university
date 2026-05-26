import sys
import socket
import io
import configparser
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO


def build_config():
    cfg = configparser.ConfigParser()
    cfg['server'] = {
        'host':'localhost',
        'port':'8080'
    }
    return cfg


def serialize_config(cfg):
    buf = io.StringIO()
    cfg.write(buf)
    return buf.getvalue()


def main():
    cfg = build_config()
    payload = serialize_config(cfg).encode('utf-8')
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(('localhost',5500))
        s.sendall(payload)
        print(f"Sent INI config to localhost:5500")


class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestINIConfigClient(unittest.TestCase):

    @patch('socket.socket')
    def test_sends_ini(self, mock_socket_class):
        mock_sock = MagicMock()
        mock_socket_class.return_value.__enter__.return_value = mock_sock

        main()

        mock_sock.connect.assert_called_once_with(('localhost', 5500))
        sent = mock_sock.sendall.call_args[0][0].decode('utf-8')
        parsed = configparser.ConfigParser()
        parsed.read_string(sent)
        assert_equal(parsed['server']['host'], 'localhost')
        assert_equal(parsed['server']['port'], '8080')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        main()
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)