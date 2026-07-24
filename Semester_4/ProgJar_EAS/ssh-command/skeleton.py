import subprocess
import sys
import unittest
from unittest.mock import patch, MagicMock, call
from io import StringIO


def run_ssh_command(hostname, username, command):
    """Run one command on the remote host through the system ssh client."""
    # build the user@host target string
    target = f'{username}@{hostname}'

    # run the command via the system ssh client
    result = subprocess.run(
        ['ssh', target, command],
    )

    # forward any stderr from the remote command
    if result.stderr:
        sys.stderr.buffer.write(result.stderr)

    return result.stdout, result.returncode


def main(hostname, username):
    for command in ('echo "Hello, world!"', 'uname', 'uptime'):
        # run the command and unpack output and return code
        output, returncode = run_ssh_command(hostname, username, command)
        
        print(output)

        if returncode != 0:
            print(
                f'Command failed with exit status {returncode}: {command}',
                file=sys.stderr,
            )


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

    @patch('__main__.run_ssh_command')
    def test_main(self, mock_run_ssh):
        # Return deterministic output for each of the three commands
        mock_run_ssh.side_effect = [
            (b'Hello, world!\n', 0),
            (b'Linux\n', 0),
            (b'uptime output\n', 0),
        ]

        main('localhost', 'user')

        # Verify each command was dispatched in the correct order
        assert_equal(mock_run_ssh.call_args_list[0],
                     call('localhost', 'user', 'echo "Hello, world!"'))
        assert_equal(mock_run_ssh.call_args_list[1],
                     call('localhost', 'user', 'uname'))
        assert_equal(mock_run_ssh.call_args_list[2],
                     call('localhost', 'user', 'uptime'))

    @patch('subprocess.run')
    def test_run_ssh_command(self, mock_run):
        # Mock the subprocess result with no stderr output
        mock_result = MagicMock()
        mock_result.stdout = b'Hello, world!\n'
        mock_result.stderr = b''
        mock_result.returncode = 0
        mock_run.return_value = mock_result

        output, returncode = run_ssh_command('localhost', 'user', 'echo "Hello, world!"')

        # Verify the exact SSH command that was built
        args, kwargs = mock_run.call_args
        print(f"SSH command: {args[0]}")

        # Verify the returned stdout and exit code
        assert_equal(output, b'Hello, world!\n')
        assert_equal(returncode, 0)


if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
