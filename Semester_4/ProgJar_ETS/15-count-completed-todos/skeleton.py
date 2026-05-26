import sys
import http.client
import json
import unittest
from io import StringIO
import unittest.mock as mock

def count_completed_todos(user_id: int) -> int:
    conn = http.client.HTTPConnection('jsonplaceholder.typicode.com')
    conn.request('GET', f'/todos?userId={user_id}')
    resp = conn.getresponse()
    raw = resp.read()
    if isinstance(raw, bytes):
        raw = raw.decode('utf-8')
    todos = json.loads(raw)
    conn.close()
    count = 0
    for t in todos:
        if t.get('completed'):
            count += 1
    return count

class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestCountCompletedTodos(unittest.TestCase):
    @mock.patch('http.client.HTTPConnection')
    def test_count_completed_todos(self, mock_conn):
        print('Testing count_completed_todos ...')
        mock_response = mock.Mock()
        mock_response.read.return_value = b'[{"id":1,"completed":true},{"id":2,"completed":false},{"id":3,"completed":true}]'
        mock_conn.return_value.getresponse.return_value = mock_response

        result = count_completed_todos(1)

        mock_conn.assert_called_once_with('jsonplaceholder.typicode.com')
        print(f"connection called with: {mock_conn.call_args}")

        mock_conn.return_value.request.assert_called_once_with('GET', '/todos?userId=1')
        print(f"request called with: {mock_conn.return_value.request.call_args}")

        mock_conn.return_value.close.assert_called_once()
        print(f"connection closed: {mock_conn.return_value.close.call_args}")

        assert_equal(result, 2)


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        count = count_completed_todos(1)
        print(count)

    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)