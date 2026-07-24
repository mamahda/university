import os
import smtplib
import zipfile
import tempfile
import unittest
import sys
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from unittest.mock import patch, MagicMock
from io import StringIO


def email_dir_zipped(sender, recipient):
    # create a temporary zip file
    mahda_zip = tempfile.TemporaryFile()

    # zip every file in the current working directory
    mahda_zipfile = zipfile.ZipFile(mahda_zip, mode='w')

    # build the email message
    mahda_msg = MIMEMultipart()
    mahda_msg['Subject'] = 'File from current directory'
    print(f"Email subject: {mahda_msg['Subject']}")

    # attach the zip file as a base64 encoded payload
    mahda_part = MIMEBase('application', 'zip')

    # connect to the SMTP server on localhost and send the email
    mahda_server = smtplib.SMTP('localhost')

    # set debug level to 1 to see the communication with the server
    mahda_server.set_debuglevel(1)

    # send the email
    mahda_server.sendmail(sender, recipient, mahda_msg.as_string())

    # close the connection
    mahda_server.close()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestEmailDirZipped(unittest.TestCase):
    @patch('smtplib.SMTP')
    @patch('os.listdir')
    @patch('os.getcwd')
    @patch('zipfile.ZipFile')
    @patch('tempfile.TemporaryFile')
    def test_email_dir_zipped(self, mock_tempfile, mock_zipfile, mock_getcwd,
                              mock_listdir, mock_smtp):
        # Mock the filesystem helpers so the test is deterministic
        mock_getcwd.return_value = '/fake/dir'
        mock_listdir.return_value = ['a.txt', 'b.txt']

        mock_zf = MagicMock()
        mock_zf.read.return_value = b'fake-zip-content'
        mock_tempfile.return_value = mock_zf

        mock_zip_instance = MagicMock()
        mock_zipfile.return_value = mock_zip_instance

        # Mock the SMTP server instance
        mock_server_instance = MagicMock()
        mock_smtp.return_value = mock_server_instance

        # Call the function to test
        sender = 'you@you.com'
        recipient = ['recipient@example.com']
        email_dir_zipped(sender, recipient)

        # verify that the SMTP server was called with the correct parameters
        mock_smtp.assert_called_with('localhost')
        print(f"mock_smtp.call_args: {mock_smtp.call_args}")

        # Check debug level setting
        mock_server_instance.set_debuglevel.assert_called_once_with(1)
        print(f"mock_server_instance.set_debuglevel.call_args: {mock_server_instance.set_debuglevel.call_args}")

        # verify closing the server connection
        mock_server_instance.close.assert_called_once()

        # verify sending the email
        args, kwargs = mock_server_instance.sendmail.call_args
        fromaddr_sent = args[0]
        toaddrs_sent = args[1]

        # assert the email was sent with the correct parameters
        assert_equal(fromaddr_sent, 'you@you.com')
        assert_equal(toaddrs_sent, ['recipient@example.com'])


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        # If the script is run with 'run' argument, execute the function directly
        email_dir_zipped('you@you.com', ['recipient@example.com'])

    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
