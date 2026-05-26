import sys
import socket
import json
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO


def update_post_title(post_id, new_title):
    host = 'jsonplaceholder.typicode.com'
    port = 80
    payload = json.dumps({"title": new_title})
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        
        # Send HTTP PATCH request with JSON body
        request = (
            f"PATCH /posts/{post_id} HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            f"Content-Type: application/json\r\n"
            f"Content-Length: {len(payload)}\r\n"
            f"Connection: close\r\n\r\n"
            f"{payload}"
        )
        s.send(request.encode('utf-8'))
        
        response_data = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response_data += chunk
            
    response = response_data.decode('utf-8')
    _, body = response.split('\r\n\r\n', 1)
    
    data = json.loads(body)
    return data.get('title')


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestUpdatePostTitle(unittest.TestCase):
    @patch('socket.socket')
    def test_update_post_title(self, mock_socket):
        # Setup the mocked socket instance
        mock_sock_instance = MagicMock()
        mock_socket.return_value.__enter__.return_value = mock_sock_instance

        # Define the mock response from the server
        updated_title = "Updated Title"
        response_data = {'title': updated_title}
        http_response = f"HTTP/1.1 200 OK\r\nContent-Length: {len(json.dumps(response_data))}\r\n\r\n{json.dumps(response_data)}"
        mock_sock_instance.recv.side_effect = [http_response.encode('utf-8'), b'']

        # Call the function
        result_title = update_post_title(1, updated_title)

        # Ensure the response indicates successful update
        mock_sock_instance.connect.assert_called_once_with(('jsonplaceholder.typicode.com', 80))
        print(f"connect called with: {mock_sock_instance.connect.call_args}")

        # Assertions to check if the PATCH request was properly sent and the correct title was returned
        mock_sock_instance.send.assert_called_once()
        print(f"send called with: {mock_sock_instance.send.call_args}")

        mock_sock_instance.recv.assert_called()
        print(f"recv called with: {mock_sock_instance.recv.call_args}")

        assert_equal(result_title, updated_title)

        
if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        title = update_post_title(1, "New Title")
        print(title)

    # run unit test to test locally
    # or for domjudge
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)

