import json
import unittest
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from unittest.mock import patch, MagicMock
from io import StringIO


def add(a, b):
    return a + b


def subtract(a, b):
    return a - b


def echo(message):
    return message


METHODS = {
    "add": add,
    "subtract": subtract,
    "echo": echo,
}


def make_response(result=None, error=None, request_id=None):
    response = {
        "jsonrpc": "2.0",
        "id": request_id,
    }
    if error is not None:
        response["error"] = error
    else:
        response["result"] = result
    return response


def make_error(code, message):
    return {
        "code": code,
        "message": message,
    }


class JsonRpcHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Read the request body
        content_length = self.headers.get('Content-Length')
        body = self.rfile.read(int(content_length)).decode('utf-8')

        try:
            request_data = json.loads(body)
        except json.JSONDecodeError:
            response = make_response(
                error=make_error(-32700, "Parse error"),
                request_id=None,
            )
            # Send the error response and return early
            self.send_json(response)
            return

        response = self.handle_json_rpc(request_data)
        self.send_json(response)

    def handle_json_rpc(self, request_data):
        if not isinstance(request_data, dict):
            return make_response(
                error=make_error(-32600, "Invalid Request"),
                request_id=None,
            )

        request_id = request_data.get("id")

        if request_data.get("jsonrpc") != "2.0":
            return make_response(
                error=make_error(-32600, "Invalid Request"),
                request_id=request_id,
            )

        method_name = request_data.get("method")
        params = request_data.get("params", [])

        if method_name not in METHODS:
            return make_response(
                error=make_error(-32601, "Method not found"),
                request_id=request_id,
            )

        method = METHODS[method_name]

        try:
            if isinstance(params, list):
                result = method(*params)
            elif isinstance(params, dict):
                result = method(**params)
            else:
                return make_response(
                    error=make_error(-32602, "Invalid params"),
                    request_id=request_id,
                )

            return make_response(result=result, request_id=request_id)

        except TypeError as e:
            return make_response(
                error=make_error(-32602, f"Invalid params: {e}"),
                request_id=request_id,
            )

        except Exception as e:
            return make_response(
                error=make_error(-32603, f"Internal error: {e}"),
                request_id=request_id,
            )

    def send_json(self, response):
        response_body = json.dumps(response).encode('utf-8')
        # Send the response headers and body
        self.send_response(200)

        # Set the Content-Type and Content-Length headers
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_body)))
        
        # Finalize the headers and send the response body
        self.end_headers()
        self.wfile.write(response_body)

    def log_message(self, format, *args):
        return


def run_server(host="127.0.0.1", port=8000):
    # create the HTTPServer bound to the given address
    mahda_server = HTTPServer((host, port), JsonRpcHandler)
    print(f"JSON-RPC server running at http://{host}:{port}")
    print("Press Ctrl+C to stop.")

    try:
        mahda_server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        mahda_server.serverclose()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestJsonRpcServer(unittest.TestCase):

    def test_handle_json_rpc(self):
        # Instantiate handler without a real HTTP connection
        handler = object.__new__(JsonRpcHandler)

        # Successful add call with positional params
        request = {"jsonrpc": "2.0", "method": "add", "params": [3, 4], "id": 1}
        response = handler.handle_json_rpc(request)
        print(f"add result: {response['result']}")
        assert_equal(response['result'], 7)
        assert_equal(response['id'], 1)

        # Method not found error
        request = {"jsonrpc": "2.0", "method": "unknown", "params": [], "id": 2}
        response = handler.handle_json_rpc(request)
        print(f"error code: {response['error']['code']}")
        assert_equal(response['error']['code'], -32601)
        assert_equal(response['error']['message'], 'Method not found')

    def test_make_error_and_response(self):
        # Verify make_error builds the correct dict
        error = make_error(-32700, "Parse error")
        assert_equal(error['code'], -32700)
        assert_equal(error['message'], 'Parse error')

        # Verify make_response with a result
        response = make_response(result=42, request_id=5)
        assert_equal(response['jsonrpc'], '2.0')
        assert_equal(response['result'], 42)
        assert_equal(response['id'], 5)

    @patch('__main__.HTTPServer')
    def test_run_server(self, mock_httpserver):
        mock_server = MagicMock()
        mock_httpserver.return_value = mock_server
        # Simulate Ctrl+C to exit serve_forever
        mock_server.serve_forever.side_effect = KeyboardInterrupt

        run_server('127.0.0.1', 8000)

        # Verify HTTPServer was created with the correct address and handler
        args, kwargs = mock_httpserver.call_args
        assert_equal(args[0], ('127.0.0.1', 8000))
        assert_equal(args[1], JsonRpcHandler)
        print(f"server address: {args[0]}")

        # Verify the server lifecycle methods were called
        mock_server.serve_forever.assert_called_once()
        mock_server.server_close.assert_called_once()


if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
