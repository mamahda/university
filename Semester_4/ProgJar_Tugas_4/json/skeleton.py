import json
import sys
import unittest
from unittest.mock import patch, MagicMock
from io import StringIO

# Sample data to be serialized
test_data = {
    'name': 'Alice',
    'age': 30,
    'is_admin': True,
    'skills': ['Python', 'Network Programming', 'Digital Forensics']
}

# Functions using in-memory JSON serialization
def json_to_variable(data):
    return json.dumps(data)

def unjson_from_variable(strings):
    return json.loads(strings)

# Function to assert that two dictionaries are equal
def assert_true_dict(dict1, dict2):
    is_true = False
    for key, value in dict1.items():
        if key in dict2 and dict2[key] == value:
            is_true = True
        else:
            is_true = False
            break

    if is_true:
        print("The dictionaries match.", dict1, dict2)
    else:
        print("The dictionaries do not match.")

def assert_true_strings(str1, str2):
    if str1 == str2:
        print("The JSON strings match.", str1, str2)
    else:
        print("The JSON strings do not match.")

# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass

# Unit test
class TestJsonToVariable(unittest.TestCase):
    def setUp(self):
        self.test_data = test_data

    def test_json(self):
        json_data = json_to_variable(self.test_data)
        expected_json = json.dumps(self.test_data)
        assert_true_strings(json_data, expected_json)
    
    def test_unjson(self):
        json_data = json_to_variable(self.test_data)
        unjsoned_data = unjson_from_variable(json_data)
        assert_true_dict(self.test_data, unjsoned_data)

# Entry point
if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        json_data = json_to_variable(test_data)
        print("Serialized JSON:", json_data)
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)
