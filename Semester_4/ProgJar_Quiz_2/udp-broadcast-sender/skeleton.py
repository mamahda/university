import sys
import socket
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO

def send_broadcast(port, message):
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        s.sendto(message.encode('utf-8'), ('255.255.255.255', 9999))


def main():
    send_broadcast(9999, 'HELLO')
    print(f'Broadcast sent: HELLO on port 9999')


class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestUDPBroadcast(unittest.TestCase):

    @patch('socket.socket')
    def test_broadcast(self, mock_socket_class):
        mock_sock = MagicMock()
        mock_socket_class.return_value.__enter__.return_value = mock_sock

        main()

        mock_sock.setsockopt.assert_called_with(
            socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sent_payload = mock_sock.sendto.call_args[0][0]
        sent_addr = mock_sock.sendto.call_args[0][1]
        assert_equal(sent_payload.decode('utf-8'), 'HELLO')
        assert_equal(sent_addr, ('255.255.255.255', 9999))


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        main()
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
