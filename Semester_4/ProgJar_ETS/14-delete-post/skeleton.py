import sys
import http.client
import unittest
from io import StringIO
import unittest.mock as mock


def delete_post(post_id: int) -> int:
    conn = http.client.HTTPConnection('jsonplaceholder.typicode.com')
    conn.request('DELETE', f'/posts/{post_id}')
    resp = conn.getresponse()
    status = getattr(resp, 'status', 0)
    conn.close()
    return status

class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestDeletePost(unittest.TestCase):
    @mock.patch('http.client.HTTPConnection')
    def test_delete_post(self, mock_conn):
        print('Testing delete_post ...')
        mock_response = mock.Mock()
        mock_response.status = 200
        mock_conn.return_value.getresponse.return_value = mock_response

        result = delete_post(1)

        mock_conn.assert_called_once_with('jsonplaceholder.typicode.com')
        print(f"connection called with: {mock_conn.call_args}")

        mock_conn.return_value.request.assert_called_once_with('DELETE', '/posts/1')
        print(f"request called with: {mock_conn.return_value.request.call_args}")

        mock_conn.return_value.close.assert_called_once()
        print(f"connection closed: {mock_conn.return_value.close.call_args}")

        assert_equal(result, 200)


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        status = delete_post(1)
        print(status)

    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)