import sys
import unittest
from ftplib import FTP
from unittest.mock import patch, MagicMock
from io import StringIO


def change_directory(host, username, password, directory):
    ftp = FTP(host)
    ftp.login(username, password)
    try:
        ftp.cwd(directory)
        print(f"Changed directory to '{directory}' successfully.")
    except Exception as e:
        print(f"Failed to change directory: {e}")
    ftp.quit()


class NullWriter(StringIO):
    def write(self, txt):
        pass


class TestCWD(unittest.TestCase):

    @patch('__main__.FTP')
    def test_cwd_success(self, mock_ftp_class):
        mock_ftp = MagicMock()
        mock_ftp_class.return_value = mock_ftp

        change_directory('localhost', 'hudan', '123', '/srv/data')

        mock_ftp.login.assert_called_once_with('hudan', '123')
        print(f"login called with {mock_ftp.login.call_args}")
        mock_ftp.cwd.assert_called_once_with('/srv/data')
        print(f"cwd called with {mock_ftp.cwd.call_args}")
        mock_ftp.quit.assert_called_once()
        print(f"quit called with {mock_ftp.quit.call_args}")

    @patch('__main__.FTP')
    def test_cwd_failure(self, mock_ftp_class):
        mock_ftp = MagicMock()
        mock_ftp_class.return_value = mock_ftp
        mock_ftp.cwd.side_effect = Exception('nope')

        change_directory('localhost', 'hudan', '123', '/srv/data')

        mock_ftp.login.assert_called_once_with('hudan', '123')
        print(f"login called with {mock_ftp.login.call_args}")
        mock_ftp.cwd.assert_called_once_with('/srv/data')
        print(f"cwd called with {mock_ftp.cwd.call_args}")
        mock_ftp.quit.assert_called_once()
        print(f"quit called with {mock_ftp.quit.call_args}")


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        change_directory('localhost', 'hudan', '123', '/srv/data')
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
