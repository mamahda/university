from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO


def call_add(a, b):
    url = "http://127.0.0.1:8000"

    # Build a proper XML-RPC request body with two integer params
    request_body = f"""<?xml version="1.0"?>
<methodCall>
  <methodName>add</methodName>
  <params>
    <param><value><int>{a}</int></value></param>
    <param><value><int>{b}</int></value></param>
  </params>
</methodCall>
""".encode("utf-8")

    request = Request(
        url=url,
        data=request_body,
        headers={'Content-type': 'text/xml'},
        method='POST'
    )

    with urlopen(request) as response:
        response_data = response.read().decode('utf-8')

    # Parse response XML
    root = ET.fromstring(response_data)

    # Try to get a successful integer result
    result = root.find("./params/param/value/int")
    if result is not None and result.text is not None:
        return int(result.text)

    # Otherwise look for a fault string and raise it as RuntimeError
    fault = root.find("./fault/value/string")
    if fault is not None and fault.text is not None:
        raise RuntimeError(fault.text)

    # Unknown response format
    raise RuntimeError("Invalid XML-RPC response")


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestVeryXMLRPCClient(unittest.TestCase):

    @patch('__main__.urlopen')
    def test_call_add(self, mock_urlopen):
        response_xml = (
            b'<?xml version="1.0"?>'
            b'<methodResponse>'
            b'<params><param><value><int>15</int></value></param></params>'
            b'</methodResponse>'
        )
        mock_response = MagicMock()
        mock_response.read.return_value = response_xml
        mock_urlopen.return_value.__enter__.return_value = mock_response

        result = call_add(10, 5)

        assert_equal(result, 15)
        assert_equal(mock_urlopen.called, True)

    @patch('__main__.urlopen')
    def test_call_add_fault(self, mock_urlopen):
        fault_xml = (
            b'<?xml version="1.0"?>'
            b'<methodResponse>'
            b'<fault><value><string>Unknown method</string></value></fault>'
            b'</methodResponse>'
        )
        mock_response = MagicMock()
        mock_response.read.return_value = fault_xml
        mock_urlopen.return_value.__enter__.return_value = mock_response

        try:
            call_add(10, 5)
            print('test attribute failed: RuntimeError not raised')
        except RuntimeError as e:
            assert_equal(str(e), 'Unknown method')


if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
