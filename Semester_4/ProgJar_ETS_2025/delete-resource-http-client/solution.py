import http.client
import unittest
from unittest import mock
import sys
from io import StringIO


def delete_resource():
    conn = http.client.HTTPSConnection("jsonplaceholder.typicode.com")
    conn.request("DELETE", "/posts/1")
    response = conn.getresponse()
    status = response.status
    conn.close()

    if status == 200:
        return "Deleted successfully"
    else:
        return "Failed to delete"
    

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestDeleteResource(unittest.TestCase):
    @mock.patch('http.client.HTTPSConnection')
    def test_delete_resource_success(self, mock_connection):
        mock_response = mock.Mock()
        mock_response.status = 200
        mock_connection.return_value.getresponse.return_value = mock_response

        result = delete_resource()

        mock_connection.assert_called_once_with("jsonplaceholder.typicode.com")
        print(f"connection called with: {mock_connection.call_args}")

        mock_connection.return_value.request.assert_called_once_with("DELETE", "/posts/1")
        print(f"request called with: {mock_connection.return_value.request.call_args}")

        mock_connection.return_value.close.assert_called_once()
        print(f"connection closed: {mock_connection.return_value.close.call_args}")

        assert_equal(result, "Deleted successfully")

    @mock.patch('http.client.HTTPSConnection')
    def test_delete_resource_failure(self, mock_connection):
        mock_response = mock.Mock()
        mock_response.status = 404
        mock_connection.return_value.getresponse.return_value = mock_response

        result = delete_resource()

        mock_connection.assert_called_once_with("jsonplaceholder.typicode.com")
        print(f"connection called with: {mock_connection.call_args}")

        mock_connection.return_value.request.assert_called_once_with("DELETE", "/posts/1")
        print(f"request called with: {mock_connection.return_value.request.call_args}")

        mock_connection.return_value.close.assert_called_once()
        print(f"connection closed: {mock_connection.return_value.close.call_args}")

        assert_equal(result, "Failed to delete")


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        status = delete_resource()
        print(status)

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

    