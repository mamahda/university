import unittest
from unittest import mock
from io import StringIO
import sys
import http.client
import json

def update_resource():
    connection = http.client.HTTPSConnection("jsonplaceholder.typicode.com")
    connection.request("PATCH", "/posts/1", body='{"title": "Updated Title"}', headers={'Content-type': 'application/json'})
    response = connection.getresponse()
    response = response.read().decode('utf-8')
    connection.close()
    res = json.loads(response)
    return res["title"]


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestUpdateResource(unittest.TestCase):
    @mock.patch('http.client.HTTPSConnection')
    def test_update_resource(self, mock_connection):
        mock_response = mock.Mock()
        mock_response.read.return_value = b'{"title": "Updated Title"}'
        mock_connection.return_value.getresponse.return_value = mock_response

        result = update_resource()
        
        mock_connection.assert_called_once_with("jsonplaceholder.typicode.com")
        print(f"connection called with: {mock_connection.call_args}")

        mock_connection.return_value.request.assert_called_once_with(
            "PATCH", "/posts/1", body='{"title": "Updated Title"}', headers={'Content-type': 'application/json'}
        )
        print(f"request called with: {mock_connection.return_value.request.call_args}")

        mock_response.read.assert_called_once()
        print(f"response read: {mock_response.read.return_value}")

        mock_connection.return_value.close.assert_called_once()
        print(f"connection closed: {mock_connection.return_value.close.call_args}")

        assert_equal(result, 'Updated Title')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        status = update_resource()
        print(status)

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)