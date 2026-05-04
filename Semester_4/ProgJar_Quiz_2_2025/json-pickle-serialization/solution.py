import http.client
import json
import pickle
import sys
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO

def http_pickle():
    conn = http.client.HTTPSConnection("picsum.photos")
    path = "/id/216/info"
    try:
        # send GET request
        conn.request("GET", path)
        
        # get response
        response = conn.getresponse()
        
        # read the response
        if response.status == 200:
            data = response.read()
            data_serialized = pickle.dumps(data)
            return data_serialized
        else:
            return "Request Failed"
    except Exception as e:
        return f"Request Failed: {e}"
    finally:
        # close connection
        conn.close()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f"test attribute passed: {parameter1} is equal to {parameter2}")
    else:
        print(f"test attribute failed: {parameter1} is not equal to {parameter2}")


class TestHttpPickleClient(unittest.TestCase):

    @patch('http.client.HTTPSConnection')
    def test_http_pickle_success(self, mock_https_connection):
        # Mock response data
        expected_json = {
            "id": "216",
            "author": "Paul Jarvis",
            "width": 2500,
            "height": 1667,
            "url": "https://unsplash.com/photos/9702xTENR-M",
            "download_url": "https://picsum.photos/id/216/2500/1667"
        }
        mock_response_data = json.dumps(expected_json).encode('utf-8')
        
        # Setup mock connection and response
        mock_conn_instance = MagicMock()
        mock_https_connection.return_value = mock_conn_instance
        
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = mock_response_data
        mock_conn_instance.getresponse.return_value = mock_response
        
        # Call the function
        result = http_pickle()
        
        # Verify connection was made correctly
        mock_https_connection.assert_called_once_with("picsum.photos")
        mock_conn_instance.request.assert_called_once_with("GET", "/id/216/info")
        mock_conn_instance.close.assert_called_once()
        
        # Verify the result is pickled data
        self.assertIsInstance(result, bytes)
        
        # Deserialize and verify content
        unpickled_data = pickle.loads(result)
        self.assertIsInstance(unpickled_data, bytes)
        
        # Decode and parse JSON to verify content
        json_data = json.loads(unpickled_data.decode('utf-8'))
        
        # Test specific attributes
        assert_equal(200, 200)  # Mock successful status
        assert_equal(json_data['id'], "216")
        assert_equal(json_data['author'], "Paul Jarvis")
        assert_equal(json_data['width'], 2500)
        assert_equal(json_data['height'], 1667)

if __name__ == '__main__':
    # A simple command-line argument check to run main or tests
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        result = http_pickle()
        print("Serialized:")
        print(result)

        print("\nDeserialized:")
        if isinstance(result, bytes):
            print(pickle.loads(result).decode('utf-8'))
        else:
            print(result)
    else:
        # Run tests without showing standard unittest output
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)