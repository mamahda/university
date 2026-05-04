import socket
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO
import io
import sys

def send_packet():
    # Create a UDP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    try:
        host = "127.0.0.1"
        port = 9876

        print(f"Connected to server on port {port}")

        message = "K^sXjF@WeuQ{=nZrGMdVYtc#]Pk|a?o>Rb&Lq(ASz$Tw}iC+MJ*<!gHEhBfNUOdy"

        # Send each character one by one
        for char in message:
            client_socket.sendto(char.encode(), (host, port))

        # Receive one UDP packet (server sends all at once)
        part, _ = client_socket.recvfrom(4096)
        received_message = part.decode()

        print("Received from server:")
        print(received_message)

        # Compare to original message to find lost characters
        received_index = 0
        lost_chars = ""
        for char in message:
            if received_index >= len(received_message) or char != received_message[received_index]:
                lost_chars += char
            else:
                received_index += 1
        
        print("Lost characters:")
        print(lost_chars)

    finally:        
        # Close socket
        client_socket.close()
        print("Connection closed.")


class NullWriter(StringIO):
    def write(self, txt):
        pass


# Unit tests
class TestUDPPacket(unittest.TestCase):
    @patch("socket.socket")
    def test_send_packet_udp(self, mock_socket_cls):
        host = "127.0.0.1"
        port = 9876

        # Create mock socket and simulate it being returned from socket.socket()
        mock_socket = MagicMock()
        mock_socket_cls.return_value = mock_socket

        # Simulated response from the server
        received_message = "^sXjF@Weu{=nZrGMdVtc#]Pk|a?>Rb&Lq(AS$Tw}iC+MJ<!gHEhBfNOdy"
        expected_lost = "KQYoz*U"
        mock_socket.recvfrom.return_value = (received_message.encode(), (host, port))

        # Capture printed output
        captured_output = io.StringIO()
        sys_stdout = sys.stdout
        sys.stdout = captured_output
        try:
            send_packet()
        finally:
            sys.stdout = sys_stdout
            # print(captured_output.getvalue())

        output = captured_output.getvalue()

        # ✅ Check that the socket was created as a UDP socket
        mock_socket_cls.assert_called_with(socket.AF_INET, socket.SOCK_DGRAM)
        print("✅ Used UDP socket")

        # ✅ Check that sendto was called with correct host/port
        self.assertTrue(
            all(
                call[0][1] == (host, port) for call in mock_socket.sendto.call_args_list
            ),
            "All sendto() calls should target the correct (host, port)",
        )
        print("✅ All sendto() calls used correct server address")

        # ✅ Check output content
        self.assertIn("Connected to server on port 9876", output)
        self.assertIn(received_message, output)
        self.assertIn("Lost characters:", output)
        self.assertIn(expected_lost, output)
        self.assertIn("Connection closed.", output)

        print("✅ Output matched expected lost characters")
        print("✅ test_send_packet_udp passed all checks")


if __name__ == "__main__":
    # send_packet()
    # run unit test
    runner = unittest.TextTestRunner(stream=NullWriter())
    unittest.main(testRunner=runner, exit=False)
