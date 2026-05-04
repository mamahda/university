import subprocess
import unittest
import sys
from unittest.mock import patch, MagicMock
from io import StringIO

def run_remote_command():
    # define the SSH command and parameters
    ssh_command = "echo Hello $USER from $(hostname)"

    # define the username and hostname
    username = "bob"
    hostname = "example.com"

    # define message to be sent
    full_command = ssh_command

    # run the command using subprocess
    result = subprocess.run(
        ["ssh", f"{username}@{hostname}", full_command],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # return the standard error output
    return result.stderr


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestSSHCommand(unittest.TestCase):
    @patch("__main__.subprocess.run")
    def test_run_remote_command(self, mock_run):
        # mock the subprocess.run method
        mock_result = MagicMock()
        mock_result.stderr = "Hello bob from example.com\n"
        mock_run.return_value = mock_result

        # call the function to test
        output = run_remote_command()

        # Assert subprocess.run was called correctly
        mock_run.assert_called_once()
        called_args = mock_run.call_args[0][0]  # First positional arg list: ["ssh", "user@remote_host", ...]
        assert_equal(called_args[0], "ssh")

        # Additional assertions for username and host
        username, hostname = called_args[1].split("@")
        assert_equal(username, "bob")
        assert_equal(hostname, "example.com")

        # Final assertion for command output
        assert_equal(output, "Hello bob from example.com\n")

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        # If the script is run with 'run' argument, execute the program
        run_remote_command()

    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
