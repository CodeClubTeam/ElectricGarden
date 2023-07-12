import atexit 
import requests
import json
import base64
from urllib.parse import urlencode
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

#load_dotenv()
load_dotenv('.env.development')
try:
    API_BASE = os.getenv('API_BASE')
    API_KEY = base64.b64encode(os.getenv('API_KEY').encode('ascii')).decode('utf-8')
except Exception as ex:
    print("Environment not configured: ", ex)

AUTH_HEADER = {'Authorization': 'Basic {}'.format(API_KEY)}

def timestamp():
    return datetime.now(timezone.utc).isoformat()


class ThingAPI(object):

    def __init__(self):
        pass

    def _decodeResponse(self, response):
        text = response.text
        try:
            if response.status_code < 200 or response.status_code > 299:
                print("ERROR RESPONSE ({}): ".format(response.status_code), text)
                return None
            data = response.json()
            print("Data: ", data)
            #value = data['value']
            return data
        except:
            print("ERROR RESPONSE: ", text)
            raise
    
    def _ensureStrings(self, data):
        if isinstance(data, bytes):  return data.decode('ascii')
        if isinstance(data, dict):   return dict(map(self._ensureStrings, data.items()))
        if isinstance(data, tuple):  return tuple(map(self._ensureStrings, data))
        return data

    def save_log_entry(self, entry):
        entry = self._ensureStrings(entry)
        try:
            uri = API_BASE + "log"
            response = requests.post(uri, json=entry, headers=AUTH_HEADER)
            return self._decodeResponse(response)
        except TypeError as err:
            print("Log not saved - continuing: ", err)
            return None

    def increment_units(self, batch_number, device_increment_key):
        data = {
            'batch_number': batch_number,
            'device_increment_key': device_increment_key
        }
        response = requests.post(API_BASE + "incrementBatch", json=data, headers=AUTH_HEADER)
        return self._decodeResponse(response)

    def _find_thing_query(self, query_properties):
        query = {}
        if '_id' in query_properties: # _id is the best way to find a thing
            query = { 'key': '_id', 'value': query_properties['_id'] }
        else:
            if '_hardware' in query_properties:
                query = { 'key': '_hardware', 'value': query_properties['_hardware'] }
            elif 'serial' in query_properties:
                query = { 'key': 'serial', 'value': query_properties['serial'] }
            elif 'mac' in query_properties:
                query = { 'key': 'mac', 'value': query_properties['mac'] }
            else:
                raise ValueError('Could not find a unique property to find thing with: _id, _hardware, serial, mac.')
        return query

    def find_thing(self, query_properties):
        query = self._find_thing_query(query_properties)
        uri = API_BASE + "thing?" + urlencode(query)
        print(query, API_BASE, uri, AUTH_HEADER)
        response = requests.get(uri, headers=AUTH_HEADER)
        print(response)
        return self._decodeResponse(response)
        
    def get_thing_by_id(self, query_properties):
        #query = self._find_thing_query(query_properties)
        #print("URLEncode query: ", urlencode(query))
        #uri = API_BASE + "thing?" + urlencode(query)
        print(query_properties)
        uri = API_BASE + "thing/" + query_properties
        #print(query, API_BASE, uri, AUTH_HEADER)
        print(uri)
        response = requests.get(uri, headers=AUTH_HEADER)
        print(response)
        return self._decodeResponse(response)

    def insert_thing(self, entity):
        """Inserts a new Thing and returns the ID of it"""
        response = requests.post(API_BASE + "thing", json=entity, headers=AUTH_HEADER)
        print("insert thing response: ", response)
        return self._decodeResponse(response)["_id"]

    def update_thing(self, entity):
        """Updates an existing Thing and returns the updated entity"""
        uri = API_BASE + "thing/" + entity["_id"]
        print("PUT to ", uri)
        response = requests.put(uri, json=entity, headers=AUTH_HEADER)
        return self._decodeResponse(response)

def test():
    api = ThingAPI()
    thing = api.find_thing({'serial' : '3HLL849'})
    print(thing)

def testById():
    api = ThingAPI()
    thing = api.find_thing({ '_id': '5d3905162ec3e0179c13461a'})
    print(thing)

def testNoThing():
    api = ThingAPI()
    thing = api.find_thing({'serial' : '3HLLQQQ'})
    print(thing)

def testIncrement():
    api = ThingAPI()
    thing = api.increment_units(123, "test")
    print(thing)

def testInsert():
    api = ThingAPI()
    thing = api.insert_thing({'serial' : 'ABC123'})
    print(thing)

def testUpdate():
    api = ThingAPI()
    thing = api.update_thing({ "_id": "5d3905162ec3e0179c13461a", "serial" : "XYZ987"})
    print(thing)

def testLog():
    api = ThingAPI()
    x = api.save_log_entry({"record": {"message": "Hello"}})
    print(x)


def testLogWithBytes():
    api = ThingAPI()
    x = api.save_log_entry({"record": {"message": b'Hello'}})
    print(x)

if __name__ == '__main__':
    testLogWithBytes()