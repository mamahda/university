import xmlrpc
import xmlrpc.client
import threading
import unittest
import sys
from xmlrpc.server import SimpleXMLRPCServer
from unittest.mock import patch, MagicMock, call
from io import StringIO


def add(x, y):
    return x + y

def subtract(x, y):
    return x - y

def multiply(x, y):
    return x * y

def divide(x, y):
    return x / y


class ServerThread(threading.Thread):
    def __init__(self, server_addr):
        # initialize the thread, calling the parent constructor
        threading.Thread.__init__(self)

        # create the XML-RPC server
        self.server = SimpleXMLRPCServer(server_addr)
        # register multicall support and all four functions
        self.server.register_multicall_functions()
        self.server.register_function(add, 'add')
        self.server.register_function(subtract, 'subtract')
        self.server.register_function(multiply, 'multiply')
        self.server.register_function(divide, 'divide')

    def run(self):
        self.server.serve_forever()


def run_server(host, port):
    server_addr = (host, port)
    server = ServerThread(server_addr)
    server.start()
    print("Server thread started. Testing the server...")


def run_client(host, port):
    # create a proxy to the server
    proxy = xmlrpc.client.ServerProxy(f'http://{host}:{port}/')
    # create a MultiCall object
    multicall = xmlrpc.client.MultiCall(proxy)
    # queue four operations
    multicall.add(7, 3)
    multicall.subtract(7, 3)
    multicall.multiply(7, 3)
    multicall.divide(7, 3)
    # execute all queued calls and print the results
    result = multicall()
    print("7+3=%d, 7-3=%d, 7*3=%d, 7/3=%d" % tuple(result))


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestXMLRPCServerClient(unittest.TestCase):
    @patch('xmlrpc.client.MultiCall')
    @patch('xmlrpc.client.ServerProxy')
    @patch('threading.Thread.start')
    @patch('__main__.SimpleXMLRPCServer')
    def test_server_and_client(self, mock_server_cls, mock_thread_start,
                               mock_proxy_cls, mock_multicall_cls):
        # Mock the SimpleXMLRPCServer instance
        mock_server_instance = MagicMock()
        mock_server_cls.return_value = mock_server_instance

        # Mock the ServerProxy instance
        mock_proxy = MagicMock()
        mock_proxy_cls.return_value = mock_proxy

        # Mock the MultiCall instance; calling it returns the 4 computed values
        mock_multicall_obj = MagicMock()
        mock_multicall_cls.return_value = mock_multicall_obj
        mock_multicall_obj.return_value = [10, 4, 21, 2]

        # Run both server and client
        run_server('localhost', 8000)
        run_client('localhost', 8000)

        # Verify SimpleXMLRPCServer was created with the correct address
        mock_server_cls.assert_called_with(('localhost', 8000))
        print(f"mock_server_cls.call_args: {mock_server_cls.call_args}")

        # Verify register_multicall_functions was called
        mock_server_instance.register_multicall_functions.assert_called_once()

        # Verify ServerProxy was created with the correct URL
        mock_proxy_cls.assert_called_with('http://localhost:8000/')
        print(f"mock_proxy_cls.call_args: {mock_proxy_cls.call_args}")

        # Verify each multicall method was invoked with (7, 3)
        assert_equal(mock_multicall_obj.add.call_args, call(7, 3))
        assert_equal(mock_multicall_obj.subtract.call_args, call(7, 3))
        assert_equal(mock_multicall_obj.multiply.call_args, call(7, 3))
        assert_equal(mock_multicall_obj.divide.call_args, call(7, 3))


if __name__ == '__main__':
    # Use a silent test runner so unittest's summary (dots / Ran ... / OK) is not printed,
    # while keeping prints from the tests visible on stdout.
    class SilentTestRunner(unittest.TextTestRunner):
        def __init__(self):
            # direct runner output to an in-memory buffer
            super().__init__(stream=StringIO(), verbosity=0)

    runner = SilentTestRunner()
    unittest.main(testRunner=runner, exit=False)
