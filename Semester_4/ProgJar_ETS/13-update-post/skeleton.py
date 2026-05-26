import sys
import http.client
import json
import unittest
from io import StringIO
import unittest.mock as mock

def update_post(post_id: int, title: str, body: str, user_id: int) -> dict:
    conn = http.client.HTTPConnection('jsonplaceholder.typicode.com')
    data = json.dumps({'id': post_id, 'title': title, 'body': body, 'userId': user_id})
    headers = {
        'Content-Type': 'application/json',
        'Content-Length': str(len(data))
    }
    conn.request('PUT', f'/posts/{post_id}', body=data, headers=headers)
    resp = conn.getresponse()
    raw = resp.read()
    try:
        decoded = raw.decode()
    except Exception:
        decoded = raw
    try:
        parsed = json.loads(decoded)
    except Exception:
        parsed = {}
    conn.close()
    return parsed

class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestUpdatePost(unittest.TestCase):
    @mock.patch('http.client.HTTPConnection')
    def test_update_post(self, mock_http_connection):
        print('Testing update_post ...')
        mock_conn = mock_http_connection.return_value
        expected_data = json.dumps({'id': 1, 'title': 'Updated Title', 'body': 'Updated body', 'userId': 1})
        expected_headers = {
            'Content-Type': 'application/json',
            'Content-Length': str(len(expected_data))
        }
        mock_response = mock.Mock()
        mock_response.read.return_value.decode.return_value = '{"id": 1, "title": "Updated Title", "body": "Updated body", "userId": 1}'
        mock_conn.getresponse.return_value = mock_response

        result = update_post(1, 'Updated Title', 'Updated body', 1)

        mock_http_connection.assert_called_once_with('jsonplaceholder.typicode.com')
        print(f"connection called with: {mock_http_connection.call_args}")

        mock_conn.request.assert_called_once_with('PUT', '/posts/1', body=expected_data, headers=expected_headers)
        print(f"request called with: {mock_conn.request.call_args}")

        mock_conn.close.assert_called_once()
        print(f"connection closed: {mock_conn.close.call_args}")

        assert_equal(result['id'], 1)
        assert_equal(result['title'], 'Updated Title')


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        post = update_post(1, 'Updated Title', 'Updated body', 1)
        print(post)

    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
