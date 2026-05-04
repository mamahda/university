import unittest
import http.client
import json
import sys
from unittest.mock import MagicMock, patch
from io import StringIO

login_url = "/auth/login"
getUser_url = "/auth/me"
todos_url = "/todos/"

# Function to make a request and return the response
def make_request(method, path, headers, body=None):
    # TODO: Create HTTPS connection to dummyjson.com
    conn = http.client.HTTPSConnection("dummyjson.com")
    # TODO: Send request with the given method, path, headers, and optional body
    conn.request(method, path, body, headers)
    # TODO: Read and return response status and data
    response = conn.getresponse()
    data = response.read().decode("utf-8")
    return response.status, data


def login(username, password):
    payload = json.dumps(
        {
            # TODO: Add login credentials to payload
            "username": username,
            "password": password,
        }
    )

    headers = {
        "Content-Type": "application/json",
        "Cookie": "accessToken=tokenLogin",
    }

    # TODO: Call make_request for login endpoint
    status, data = make_request(
        "POST",
        login_url,
        headers,
        payload,
    )

    if status != 200:
        # TODO: Handle failed login
        print("Login failed")
        return None, None
        
    # TODO: Load JSON from response and extract access token
    response_data = json.loads(data) 
    access_token = response_data.pop("accessToken", None)
    response_data.pop("refreshToken", None)

    return access_token, response_data


def handle_authenticated_requests(access_token):
    headers = {
        "Authorization": "Bearer <access_token>", # TODO: Insert Bearer token
        "Content-Type": "application/json",
    }

    # TODO: GET /auth/me
    status_auth, _ = make_request(
        "GET",
        getUser_url,
        headers,
        )

    if status_auth == 200:
        # TODO: Prepare PUT /todos/2 payload
        put_payload = json.dumps(
        {
            "todo": "Memorize a poem",
            "completed": False,
        }
        )

        # TODO: Send PUT request
        status_update, data_update = make_request(
            "PUT",
            todos_url + "2",
            headers,
            put_payload,
        )
        data_update = json.loads(data_update)

        # TODO: Send DELETE /todos/1 request
        status_delete, data_delete = make_request(
            "DELETE",
            todos_url + "1",
            headers,
        )
        data_delete = json.loads(data_delete)

        return status_auth, status_update, data_update, status_delete, data_delete


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


def assert_equal(parameter1, parameter2):
    if parameter1 == parameter2:
        print(f"test attribute passed: {parameter1} is equal to {parameter2}")
    else:
        print(f"test attribute failed: {parameter1} is not equal to {parameter2}")


class TestFetchUserInfo(unittest.TestCase):
    @patch("http.client.HTTPSConnection")
    def test_login_and_requests(self, MockHTTPSConnection):
        # Prepare mock response for login
        mock_response_login = MagicMock()
        mock_response_login.status = 200
        mock_response_login.read.return_value = json.dumps(
            {
                "id": 1,
                "firstName": "Emily",
                "lastName": "Johnson",
                "email": "emily.johnson@x.dummyjson.com",
                "gender": "female",
                "image": "https://dummyjson.com/icon/emilys/128",
                "accessToken": "dummyAccessToken",
            }
        ).encode("utf-8")

        # Prepare generic success response for the rest
        mock_response_rest = MagicMock()
        mock_response_rest.status = 200
        mock_response_rest.read.return_value = b"{}"

        mock_response_put = MagicMock()
        mock_response_put.status = 200
        mock_response_put.read.return_value = json.dumps(
            {"id": 2, "todo": "Memorize a poem", "completed": False, "userId": 13}
        ).encode("utf-8")

        mock_response_delete = MagicMock()
        mock_response_delete.status = 200
        mock_response_delete.read.return_value = json.dumps(
            {
                "id": 1,
                "todo": "Do something nice for someone you care about",
                "completed": False,
                "userId": 152,
                "isDeleted": True,
                "deletedOn": "2025-05-04T20:03:04.833Z",
            }
        ).encode("utf-8")

        # Set the side effect of getresponse to simulate multiple calls
        MockHTTPSConnection.return_value.getresponse.side_effect = [
            mock_response_login,  # login
            mock_response_rest,  # /auth/me
            mock_response_put,  # PUT
            mock_response_delete,  # DELETE
        ]

        access_token, user_data = login("emilys", "emilyspass")
        status_auth, status_update, data_update, status_delete, data_delete = (
            handle_authenticated_requests(access_token)
        )

        for conn_call in MockHTTPSConnection.call_args_list:
            args, kwargs = conn_call
            assert args[0] == "dummyjson.com"
        print(f"connection called with: {MockHTTPSConnection.call_args}")

        self.assertEqual(status_auth, 200)
        print("✅ GET /auth/me")

        # Now you can make the assertions on the dictionary
        assert_equal(user_data["id"], 1)
        assert_equal(user_data["firstName"], "Emily")
        assert_equal(user_data["lastName"], "Johnson")
        assert_equal(user_data["email"], "emily.johnson@x.dummyjson.com")
        assert_equal(user_data["gender"], "female")
        assert_equal(user_data["image"], "https://dummyjson.com/icon/emilys/128")

        self.assertEqual(status_update, 200)
        print("✅ PUT /todos/2 passed")

        assert_equal(data_update["id"], 2)
        assert_equal(data_update["todo"], "Memorize a poem")
        assert_equal(data_update["completed"], False)

        self.assertEqual(status_delete, 200)
        print("✅ DELETE /todos/1 passed")

        assert_equal(data_delete["id"], 1)
        assert_equal(
            data_delete["todo"], "Do something nice for someone you care about"
        )
        assert_equal(data_delete["completed"], False)

    @patch("http.client.HTTPSConnection")
    def test_login_failure_400(self, MockHTTPSConnection):
        # Mock response for 400 Bad Request
        mock_response_400 = MagicMock()
        mock_response_400.status = 400
        mock_response_400.read.return_value = b'{"message": "Bad Request"}'

        # Apply the mock response to getresponse
        MockHTTPSConnection.return_value.getresponse.return_value = mock_response_400

        # Suppress stdout to avoid print clutter
        original_stdout = sys.stdout
        sys.stdout = NullWriter()

        access_token, user_data = login("invalid_user", "invalid_pass")

        # Re-enable stdout
        sys.stdout = original_stdout

        # Now assert that the login failed as expected
        self.assertIsNone(access_token)
        self.assertIsNone(user_data)
        print("✅ test_login_failure_400: handled 400 Bad Request correctly")


if __name__ == "__main__":
    # to run the script without unit test:
    # python solution.py run
    if len(sys.argv) == 2 and sys.argv[1] == "run":
        # Ask for username and password as input
        username = input("Enter your username: ")
        password = input("Enter your password: ")
        access_token, user_data = login(username, password)

        if access_token is None:
            print("Login failed, cannot proceed with authenticated requests.")
        else:
            status_auth, status_update, data_update, status_delete, data_delete = (
                handle_authenticated_requests(access_token)
            )

            # Proceed to print and assert statements as before
            print("Login :", access_token)
            print("User :", user_data)
            print("Auth :", status_auth)
            print("Update :", status_update)
            print("Update Data :", data_update)
            print("Delete :", status_delete)
            print("Delete Data :", data_delete)
    # run unit test to test locally
    # or for domjudge
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
