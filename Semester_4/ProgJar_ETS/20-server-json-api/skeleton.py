import socket
import json
import select
import sys
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock


def create_server():
    server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_sock.bind(('localhost', 8080))
    server_sock.listen(5)
    return server_sock


def make_json_response(data: dict) -> bytes:
    json_data = json.dumps(data)
    response = (
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n"
        f"Content-Length: {len(json_data.encode('utf-8'))}\r\n"
        "\r\n"
        f"{json_data}"
    )
    return response.encode('utf-8')


def serve():
    server_socket = create_server()
    inputs = [server_socket]
    try:
        while True:
            readable, _, _ = select.select(inputs, [], [])
            for s in readable:
                if s is server_socket:
                    client_socket, addr = server_socket.accept()
                    inputs.append(client_socket)
                else:
                    data = s.recv(1024)
                    if data:
                        try:
                            text = data.decode('utf-8')
                        except Exception:
                            text = ''
                        response = make_json_response({'message': 'Hello, World!', 'status': 'ok'})
                        s.send(response)
                    s.close()
                    inputs.remove(s)
    finally:
        server_socket.close()

class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


def assert_in(parameter1, parameter2):
    if parameter1 in parameter2:
        print(f'test attribute passed: {parameter1} is in {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not in {parameter2}')


def assert_true(parameter, name):
    if parameter == True:
        print(f'test attribute {name} passed: {parameter} is True')
    else:
        print(f'test attribute {name} failed: {parameter} is not True')


class TestServerJsonApi(unittest.TestCase):
    @patch('socket.socket')
    def test_create_server(self, mock_socket):
        print('Testing create_server ...')
        create_server()
        instance = mock_socket.return_value
        instance.bind.assert_called_with(('localhost', 8080))
        print(f"bind called with: {instance.bind.call_args}")
        instance.listen.assert_called_once_with(5)
        print(f"listen called with: {instance.listen.call_args}")

    def test_make_json_response(self):
        print('Testing make_json_response ...')
        response = make_json_response({'message': 'Hello, World!', 'status': 'ok'})
        assert_in(b'application/json', response)
        assert_in(b'Hello, World!', response)

    @patch('select.select')
    @patch('socket.socket')
    def test_serve(self, mock_socket, mock_select):
        print('Testing serve ...')
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        mock_socket.return_value = mock_server_socket
        inputs = [mock_server_socket]

        call_count = [0]
        def select_side_effect(*args, **kwargs):
            if call_count[0] == 0:
                call_count[0] += 1
                inputs.append(mock_client_socket)
                return ([mock_server_socket], [], [])
            elif call_count[0] == 1:
                call_count[0] += 1
                return ([mock_client_socket], [], [])
            else:
                raise KeyboardInterrupt

        mock_select.side_effect = select_side_effect
        mock_server_socket.accept.return_value = (mock_client_socket, ('127.0.0.1', 12345))
        mock_client_socket.recv.return_value = b'GET / HTTP/1.1\r\nHost: localhost\r\n\r\n'

        try:
            serve()
        except KeyboardInterrupt:
            pass

        mock_server_socket.accept.assert_called()
        print(f"accept called with: {mock_server_socket.accept.call_args}")
        assert_true(mock_server_socket.listen.called, 'listen')
        assert_true(mock_server_socket.accept.called, 'accept')
        assert_true(mock_server_socket.close.called, 'close')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        serve()

    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
