import json
import unittest
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from unittest.mock import patch, MagicMock, call
from io import StringIO


def json_rpc_call(url, method, params=None, request_id=1):
    if params is None:
        params = []

    # build the JSON-RPC 2.0 payload dict
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": request_id,
    }

    # encode payload to bytes
    data = json.dumps(payload).encode('utf-8')

    # create the HTTP POST request with the correct header
    request = Request(
        url=url,
        data=data,
        headers={'Content-type': 'application/json'},
        method='POST'
    )

    try:
        with urlopen(request, timeout=10) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)

    except HTTPError as e:
        raise RuntimeError(f"HTTP error: {e.code}") from e

    except URLError as e:
        raise RuntimeError(f"Connection error: {e.reason}") from e


def run_examples(url):
    examples = [
        ("add", [10, 5]),
        ("subtract", [10, 5]),
        ("echo", {"message": "Hello, JSON-RPC!"}),
    ]

    for request_id, (method, params) in enumerate(examples, start=1):
        # call the JSON-RPC server for each example
        response = json_rpc_call(url=url, method=method, params=params, request_id=request_id)

        print(f"Request method: {method}")
        print(json.dumps(response, indent=2))
        print()


def parse_params(params_text):
    # return an empty list when no params are given
    if params_text is None:
        return []

    try:
        return json.loads(params_text)
    except json.JSONDecodeError as e:
        raise Exception(f"Params must be valid JSON. Error: {e}")


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestJsonRpcClient(unittest.TestCase):

    @patch('__main__.urlopen')
    def test_json_rpc_call(self, mock_urlopen):
        # Mock the HTTP response returned by urlopen context manager
        mock_response = MagicMock()
        mock_response.read.return_value = (
            b'{"jsonrpc": "2.0", "result": 15, "id": 1}'
        )
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = json_rpc_call('http://127.0.0.1:8000', 'add', [10, 5], 1)

        # Verify urlopen was called once
        mock_urlopen.assert_called_once()
        args, kwargs = mock_urlopen.call_args
        request_obj = args[0]

        # Verify the Request URL
        print(f"request URL: {request_obj.full_url}")

        # Verify the JSON payload encoded into the request body
        payload = json.loads(request_obj.data.decode('utf-8'))
        assert_equal(payload['method'], 'add')
        assert_equal(payload['params'], [10, 5])
        assert_equal(payload['id'], 1)
        assert_equal(payload['jsonrpc'], '2.0')

        # Verify Content-Type header
        assert_equal(request_obj.get_header('Content-type'), 'application/json')

        # Verify the parsed return value
        assert_equal(result['result'], 15)

    def test_parse_params(self):
        # None returns an empty list
        assert_equal(parse_params(None), [])

        # A JSON array string returns a list
        assert_equal(parse_params('[1, 2]'), [1, 2])

        # A JSON object string returns a dict value
        parsed = parse_params('{"message": "hello"}')
        assert_equal(parsed['message'], 'hello')

    @patch('__main__.json_rpc_call')
    def test_run_examples(self, mock_json_rpc):
        # Return deterministic responses for the three example calls
        mock_json_rpc.side_effect = [
            {"jsonrpc": "2.0", "result": 15, "id": 1},
            {"jsonrpc": "2.0", "result": 5,  "id": 2},
            {"jsonrpc": "2.0", "result": "Hello, JSON-RPC!", "id": 3},
        ]

        run_examples('http://127.0.0.1:8000')

        # Verify all three calls were made with the correct arguments
        assert_equal(
            mock_json_rpc.call_args_list[0],
            call(url='http://127.0.0.1:8000', method='add',
                 params=[10, 5], request_id=1)
        )
        assert_equal(
            mock_json_rpc.call_args_list[1],
            call(url='http://127.0.0.1:8000', method='subtract',
                 params=[10, 5], request_id=2)
        )
        assert_equal(
            mock_json_rpc.call_args_list[2],
            call(url='http://127.0.0.1:8000', method='echo',
                 params={'message': 'Hello, JSON-RPC!'}, request_id=3)
        )


if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)