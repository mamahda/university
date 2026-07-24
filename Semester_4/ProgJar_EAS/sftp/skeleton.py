import argparse
import subprocess
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO


def main(hostname, username, filename):
    local_filename = filename + '.copy'
    target = f'{username}@{hostname}'

    commands = f'get {filename} {local_filename}\n'

    result = subprocess.run(
        ['sftp', '-b', '-', target],
        input=commands
    )

    if result.returncode == 0:
        print(f"Downloaded {filename} to {local_filename}")
    else:
        print("Download failed")


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestSftp(unittest.TestCase):

    @patch('subprocess.run')
    def test_main_failure(self, mock_run):
        mock_run.return_value = MagicMock(returncode=1)

        main('example.com', 'user', 'file.txt')

        assert_equal(mock_run.called, True)
        assert_equal(mock_run.call_args[0][0],
                     ['sftp', '-b', '-', 'user@example.com'])

    @patch('subprocess.run')
    def test_main_success(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0)

        main('example.com', 'user', 'file.txt')

        assert_equal(mock_run.called, True)
        assert_equal(mock_run.call_args[0][0],
                     ['sftp', '-b', '-', 'user@example.com'])
        assert_equal('get file.txt file.txt.copy' in mock_run.call_args[1]['input'],
                     True)


if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
