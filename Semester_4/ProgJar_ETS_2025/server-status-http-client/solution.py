import http.client
import unittest
import sys
from unittest import mock
from io import StringIO

def check_server_status():
    conn = http.client.HTTPSConnection("jsonplaceholder.typicode.com")
    conn.request("GET", "/posts")
    response = conn.getresponse()
    status = response.status
    conn.close()

    if status == 200:
        return "Server is up!"
    else:
        return "Server is down!"
    

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestServerStatus(unittest.TestCase):
    @mock.patch('http.client.HTTPSConnection')
    def test_server_up(self, mock_connection):
        mock_response = mock.Mock()
        mock_response.status = 200
        mock_connection.return_value.getresponse.return_value = mock_response

        result = check_server_status()

        mock_connection.assert_called_once_with("jsonplaceholder.typicode.com")
        print(f"connection called with: {mock_connection.call_args}")

        mock_connection.return_value.request.assert_called_once_with("GET", "/posts")
        print(f"request called with: {mock_connection.return_value.request.call_args}")

        mock_connection.return_value.close.assert_called_once()
        print(f"connection closed: {mock_connection.return_value.close.call_args}")

        assert_equal(result, "Server is up!")

    @mock.patch('http.client.HTTPSConnection')
    def test_server_down(self, mock_connection):
        mock_response = mock.Mock()
        mock_response.status = 500
        mock_connection.return_value.getresponse.return_value = mock_response

        result = check_server_status()

        mock_connection.assert_called_once_with("jsonplaceholder.typicode.com")
        print(f"connection called with: {mock_connection.call_args}")

        mock_connection.return_value.request.assert_called_once_with("GET", "/posts")
        print(f"request called with: {mock_connection.return_value.request.call_args}")

        mock_connection.return_value.close.assert_called_once()
        print(f"connection closed: {mock_connection.return_value.close.call_args}")

        assert_equal(result, "Server is down!")

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        status = check_server_status()
        print(status)

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)