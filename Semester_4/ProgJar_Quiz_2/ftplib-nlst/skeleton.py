import sys
import unittest
from ftplib import FTP
from unittest.mock import patch, MagicMock
from io import StringIO


def list_names(host, username, password, directory):
    ftp = FTP(host)
    ftp.login(username, password)
    names = []
    try:
        names = ftp.nlst(directory)
        for n in names:
            print(f"name: {n}")
    except Exception as e:
        print(f"Failed to list directory: {e}")
    ftp.quit()
    return names


class NullWriter(StringIO):
    def write(self, txt):
        pass


class TestListNames(unittest.TestCase):

    @patch('__main__.FTP')
    def test_nlst_success(self, mock_ftp_class):
        mock_ftp = MagicMock()
        mock_ftp_class.return_value = mock_ftp
        mock_ftp.nlst.return_value = ['a.txt', 'b.txt', 'c.txt']

        list_names('localhost', 'hudan', '123', '/srv')

        mock_ftp.login.assert_called_once_with('hudan', '123')
        print(f"login called with {mock_ftp.login.call_args}")
        mock_ftp.nlst.assert_called_once_with('/srv')
        print(f"nlst called with {mock_ftp.nlst.call_args}")
        mock_ftp.quit.assert_called_once()
        print(f"quit called with {mock_ftp.quit.call_args}")

    @patch('__main__.FTP')
    def test_nlst_failure(self, mock_ftp_class):
        mock_ftp = MagicMock()
        mock_ftp_class.return_value = mock_ftp
        mock_ftp.nlst.side_effect = Exception('denied')

        list_names('localhost', 'hudan', '123', '/srv')

        mock_ftp.login.assert_called_once_with('hudan', '123')
        print(f"login called with {mock_ftp.login.call_args}")
        mock_ftp.nlst.assert_called_once_with('/srv')
        print(f"nlst called with {mock_ftp.nlst.call_args}")
        mock_ftp.quit.assert_called_once()
        print(f"quit called with {mock_ftp.quit.call_args}")


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        list_names('localhost', 'hudan', '123', '/srv')
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
