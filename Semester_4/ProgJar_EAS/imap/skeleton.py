import imaplib
import unittest
import sys
from unittest.mock import patch, MagicMock, call
from io import StringIO

GOOGLE_IMAP_SERVER = 'imap.googlemail.com'


def check_email(username):
    # connect to the Google IMAP SSL server on port 993
    mahda_server = imaplib.IMAP4_SSL(GOOGLE_IMAP_SERVER, '993')
    # authenticate with the server
    mahda_server.login(username, 'secret123')
    # select the Inbox folder
    mahda_server.select('Inbox')
    # search for all messages
    result, data = mahda_server.search(None, 'ALL')
    for num in data[0].split():
        # fetch the first message in RFC822 format
        result, data = mahda_server.fetch(num, '(RFC822)')
        # print the message number and the raw message bytes (as the tests expect)
        print(f'Message {num}')
        print(data[0][1])
        print()
        break
    # close the selected folder and logout
    mahda_server.close()
    mahda_server.logout()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestCheckEmail(unittest.TestCase):
    @patch('imaplib.IMAP4_SSL')
    def test_check_email(self, mock_imap4):
        # Mock the IMAP4_SSL mailbox instance
        mock_mailbox = MagicMock()
        mock_imap4.return_value = mock_mailbox

        # Mock search() to report one message with number b'1'
        mock_mailbox.search.return_value = (b'OK', [b'1'])

        # Mock fetch() to return a simple RFC822 message body
        mock_msg_body = b'From: sender@example.com\nSubject: Test Email\n\nHello!'
        mock_mailbox.fetch.return_value = (b'OK', [(b'1 (RFC822)', mock_msg_body)])

        # Call the function to test
        check_email('testuser@gmail.com')

        # Verify IMAP4_SSL was called with the correct server and port
        mock_imap4.assert_called_with('imap.googlemail.com', '993')
        print(f"mock_imap4.call_args: {mock_imap4.call_args}")

        # Verify login was called with the correct username and password
        mock_mailbox.login.assert_called_once_with('testuser@gmail.com', 'secret123')
        print(f"mock_mailbox.login.call_args: {mock_mailbox.login.call_args}")

        # Verify Inbox was selected
        assert_equal(mock_mailbox.select.call_args, call('Inbox'))

        # Verify search was called correctly
        print(f"mock_mailbox.search.call_args: {mock_mailbox.search.call_args}")

        # Verify fetch was called with the first message number and RFC822 format
        assert_equal(mock_mailbox.fetch.call_args, call(b'1', '(RFC822)'))

        # Verify close and logout were called
        mock_mailbox.close.assert_called_once()
        mock_mailbox.logout.assert_called_once()


if __name__ == '__main__':
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
