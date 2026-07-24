import socket
import pickle
import unittest
from unittest.mock import patch, MagicMock
import sys
from io import StringIO

# Sample data to be pickled
test_data = {
            'name': 'Alice',
            'age': 30,
            'is_admin': True,
            'skills': ['Python', 'Network Programming', 'Digital Forensics']
        }

# Functions using in-memory pickling
def pickle_to_variable(data):
    return pickle.dumps(data)

# Function to unpickle data from a variable
def unpickle_from_variable(data):
    return pickle.loads(data)

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

def assert_true_bytes(bytes1, bytes2):
    if bytes1 == bytes2:
        print("The byte strings match.", bytes1, bytes2)
    else:
        print("The byte strings do not match.")


# A 'null' stream that discards anything written to it
class NullWriter(StringIO):
    def write(self, txt):
        pass


# Unit test
class TestPickleToVariable(unittest.TestCase):
    def setUp(self):
        self.test_data = test_data

    def test_pickle(self):
        pickled_data = pickle_to_variable(self.test_data)
        expected_bytes = pickle.dumps(self.test_data)
        assert_true_bytes(pickled_data, expected_bytes)
    
    def test_unpickle(self):
        pickled_data = pickle_to_variable(self.test_data)
        unpickled_data = unpickle_from_variable(pickled_data)
        assert_true_dict(self.test_data, unpickled_data)

# Entry point
if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == 'run':
        pickled = pickle_to_variable(test_data)
        print("Pickled data:", pickled)
    
    else:
        runner = unittest.TextTestRunner(stream=NullWriter())
        unittest.main(testRunner=runner, exit=False)

