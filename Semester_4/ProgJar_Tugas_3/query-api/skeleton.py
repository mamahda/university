import sys
import socket
import json
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO

def count_word_in_posts(word):
    host = 'jsonplaceholder.typicode.com'
    port = 80
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        
        request = (
            f"GET /posts HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            f"Connection: close\r\n\r\n"
        )
        s.send(request.encode())
        
        response_data = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response_data += chunk
            
    response = response_data.decode()
    _, body = response.split('\r\n\r\n', 1)

    # Clean the chunked data overhead present in the mock "6b80{JSON}0"
    start = body.find('[')
    end = body.rfind(']') + 1
    clean_body = body[start:end]

    posts = json.loads(clean_body)
    
    count = 0
    for post in posts:
        if word in post.get('body', ''):
            count += 1
            
    return count


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestCountWordInPosts(unittest.TestCase):
    @patch('socket.socket')
    def test_count_word_in_posts(self, mock_socket):
        # Setup the mocked socket instance
        mock_sock_instance = MagicMock()
        mock_socket.return_value.__enter__.return_value = mock_sock_instance

        # Define the mock response from the server
        response_data = json.dumps([
            {'id': 1, 'body': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'},
            {'id': 2, 'body': 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'},
            {'id': 3, 'body': 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'},
            {'id': 4, 'body': 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur'}
        ])
        http_response = f"HTTP/1.1 200 OK\r\nContent-Length: {len(response_data)}\r\n\r\n6b80{response_data}0"
        mock_sock_instance.recv.side_effect = [http_response.encode('utf-8'), b'']

        # Call the function
        count = count_word_in_posts('voluptate')

        # Assertions to check if the correct count was returned
        mock_sock_instance.connect.assert_called_once_with(('jsonplaceholder.typicode.com', 80))
        print(f"connect called with: {mock_sock_instance.connect.call_args}")

        mock_sock_instance.send.assert_called_once()
        print(f"send called with: {mock_sock_instance.send.call_args}")

        mock_sock_instance.recv.assert_called()
        print(f"recv called with: {mock_sock_instance.recv.call_args}")

        assert_equal(count, 1)

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        word_count = count_word_in_posts('voluptate')
        print(word_count)

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

