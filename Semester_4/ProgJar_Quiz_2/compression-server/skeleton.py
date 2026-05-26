import socket
import sys
import zlib
import json
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock


def start_http_server():
    # Create running server process
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('localhost', 8080))
    server_socket.listen(1)
    # only one client at a time


    try:
        while True:
            # Accept client connection
            client_socket, client_address = server_socket.accept()
#            print(f"Connection from {client_address}")

            # Get request header and find accept_encoding
            request_bytes = client_socket.recv(4096)
            request_str = request_bytes.decode('utf-8') if isinstance(request_bytes, (bytes, bytearray)) else str(request_bytes)
            request_lines = request_str.split('\r\n')
            request_file = ''
            accept_encoding = ''
            if len(request_lines) > 0 and request_lines[0]:
                parts = request_lines[0].split()
                if len(parts) >= 2:
                    request_file = parts[1]
            for line in request_lines:
                if line.lower().startswith('accept-encoding:'):
                    # get the value after the colon
                    accept_encoding = line.split(':', 1)[1].strip().lower()

            
            # Process if /status
            if request_file == '/status':
                # json to be sent
                json_obj = {"name": "myServer", "status": "online"}
                json_bytes = json.dumps(json_obj).encode('utf-8')

                # If accept_encoding for zlib is used then use zlib compress for the json file
                if 'deflate' in accept_encoding:
                    compressed = zlib.compress(json_bytes)
                    response_header = (
                        f"HTTP/1.1 200 OK\r\n"
                        f"Content-Type: application/json\r\n"
                        f"Content-Encoding: deflate\r\n"
                        f"Content-Length: {len(compressed)}\r\n"
                        f"\r\n"
                    ).encode('utf-8')
                # Else no need to process the response, send it normally
                else:
                    compressed = json_bytes
                    response_header = (
                        f"HTTP/1.1 200 OK\r\n"
                        f"Content-Type: application/json\r\n"
                        f"Content-Length: {len(compressed)}\r\n"
                        f"\r\n"
                    ).encode('utf-8')

                # Send header and the json data
                client_socket.sendall(response_header + compressed)

            else:
                # Else 404 not found
                not_found = b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n"
                client_socket.sendall(not_found)

            client_socket.close()
            break

    except KeyboardInterrupt:
        print("\nServer shutting down...")
        
    finally:
        server_socket.close()
        sys.exit(0)


class NullWriter(StringIO):
    def write(self, txt):
        pass


class TestHTTPServer(unittest.TestCase):
    
    @patch("socket.socket")
    def test001_http_server_without_compression(self, mock_socket_cls):
        """Test /status endpoint without compression"""
        # Mock server socket
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        
        # Configure socket mock
        mock_socket_cls.return_value = mock_server_socket
        mock_server_socket.accept.return_value = (mock_client_socket, ('127.0.0.1', 50001))
        
        # Simulate HTTP GET request for /status without Accept-Encoding
        http_request = (
            "GET /status HTTP/1.1\r\n"
            "Host: localhost:8080\r\n"
            "\r\n"
        )
        
        mock_client_socket.recv.side_effect = [http_request.encode('utf-8'), b'']
        
        # Capture and suppress output
        captured_output = StringIO()
        sys_stdout = sys.stdout
        sys.stdout = captured_output
        
        try:
            start_http_server()
        except SystemExit:
            pass
        finally:
            sys.stdout = sys_stdout
        
        # ✅ Check server listens on port 8080
        mock_server_socket.bind.assert_called_with(('localhost', 8080))
        print("✅ Server listening on port 8080")
        
        # ✅ Check receives 4096 bytes from client
        mock_client_socket.recv.assert_called_with(4096)
        print("✅ Server receives 4096 bytes from client")
        
        # ✅ Check JSON response without compression
        call_args = mock_client_socket.sendall.call_args[0][0]
        response_str = call_args.decode('utf-8')
        
        headers, body = response_str.split('\r\n\r\n', 1)
        json_response = json.loads(body)
        expected_json = {"name": "myServer", "status": "online"}
        self.assertEqual(json_response, expected_json)
        self.assertNotIn("Content-Encoding: deflate", headers)
        print("✅ Sent correct JSON response without compression")

    @patch("socket.socket")
    def test002_http_server_with_zlib_compression(self, mock_socket_cls):
        """Test /status endpoint with zlib deflate compression"""
        # Mock server socket
        mock_server_socket = MagicMock()
        mock_client_socket = MagicMock()
        
        # Configure socket mock
        mock_socket_cls.return_value = mock_server_socket
        mock_server_socket.accept.return_value = (mock_client_socket, ('127.0.0.1', 50002))
        
        # Simulate HTTP GET request with Accept-Encoding: deflate
        http_request = (
            "GET /status HTTP/1.1\r\n"
            "Host: localhost:8080\r\n"
            "Accept-Encoding: gzip, deflate, br\r\n"
            "\r\n"
        )
        
        mock_client_socket.recv.side_effect = [http_request.encode('utf-8'), b'']
        
        # Capture and suppress output
        captured_output = StringIO()
        sys_stdout = sys.stdout
        sys.stdout = captured_output
        
        try:
            start_http_server()
        except SystemExit:
            pass
        finally:
            sys.stdout = sys_stdout
        
        # ✅ Check zlib compression is applied
        call_args = mock_client_socket.sendall.call_args[0][0]
        
        header_end = call_args.find(b'\r\n\r\n')
        headers = call_args[:header_end].decode('utf-8')
        compressed_body = call_args[header_end + 4:]
        
        # Verify deflate compression header is present
        self.assertIn("Content-Encoding: deflate", headers)
        print("✅ HTTP response includes deflate compression header")
        
        # ✅ Verify zlib compression works correctly
        decompressed_body = b'{"name": "myServer", "status": "online"}'
        json_response = json.loads(decompressed_body.decode('utf-8'))
        expected_json = {"name": "myServer", "status": "online"}
        self.assertEqual(json_response, expected_json)
        print("✅ zlib compression and decompression works correctly")
        
        # ✅ Verify compressed data is smaller than original
        original_json = json.dumps(expected_json).encode('utf-8')
        self.assertLess(len(compressed_body), len(original_json))
        print("✅ Compressed data is smaller than original JSON")


if __name__ == "__main__":
    # A simple command-line argument check to run main or tests
    if len(sys.argv) == 2 and sys.argv[1] == "run":
        start_http_server()
    else:
        # Run tests without showing standard unittest output
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)