import smtplib
import unittest
import sys
from unittest.mock import patch, MagicMock
from io import StringIO


def send_email():
    # define the sender and receiver email addresses, message body, and password
    # define from address and to address
    fromaddr = "sender@example.com"
    toaddrs = ["receiver@example.com"]

    # define message body
    body = "Hello, this is a test email."

    # define username and password
    username = "sender@example.com"
    password = "password123"

    # create the email message
    msg = body
    print('Message length is', len(msg))

    # connect to the SMTP server and send the email
    server = smtplib.SMTP('smtp.office365.com', 587)

    # set debug level to 1 to see the communication with the server
    server.set_debuglevel(1)

    # start TLS for security
    server.starttls()

    # login to the server
    server.login(username, password)

    # send the email
    server.sendmail(fromaddr, toaddrs, msg)

    # close the server connection
    server.quit()


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f'test attribute passed: {parameter1} is equal to {parameter2}')
    else:
        print(f'test attribute failed: {parameter1} is not equal to {parameter2}')


class TestEmailSender(unittest.TestCase):
    @patch('smtplib.SMTP')
    def test_send_email(self, mock_smtp):
        # Mock the SMTP server instance
        mock_server_instance = MagicMock()
        mock_smtp.return_value = mock_server_instance

        # Call the function to test
        send_email()

        # verify that the SMTP server was called with the correct parameters
        mock_smtp.assert_called_with('smtp.office365.com', 587)
        print(f"mock_smtp.call_args: {mock_smtp.call_args}")

        # Check debug level setting
        mock_server_instance.set_debuglevel.assert_called_once_with(1)
        print(f"mock_server_instance.set_debuglevel.call_args: {mock_server_instance.set_debuglevel.call_args}")

        # verify starting TLS
        mock_server_instance.starttls.assert_called_once()

        # verify logging in to the server
        mock_server_instance.login.assert_called_with("sender@example.com", "password123")
        print(f"mock_server_instance.login.call_args: {mock_server_instance.login.call_args}")

        # verify quitting the server
        mock_server_instance.quit.assert_called_once()

        # verify sending the email
        args, kwargs = mock_server_instance.sendmail.call_args
        fromaddr_sent = args[0]
        toaddrs_sent = args[1]
        msg_sent = args[2]

        # assert the email was sent with the correct parameters
        assert_equal(fromaddr_sent, "sender@example.com")
        assert_equal(toaddrs_sent, ["receiver@example.com"])
        assert_equal("Hello, this is a test email.", msg_sent)

if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        # If the script is run with 'run' argument, execute the tests
        send_email()

    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
