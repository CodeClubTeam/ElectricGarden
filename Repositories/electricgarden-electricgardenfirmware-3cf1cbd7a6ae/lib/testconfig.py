import json

json_current_config = """
{
  'settings': {
    'readingsEndPoint': 'https://egingestdev.azurewebsites.net/api/catm1?code=lHcVyJ1VKdVkxkZjxhwlEsPDMpgNzHXFxCRiiD03RNMDaJBKki/2lw=='
  }, 
  'serial': '8N31PAW', 
  'actions': []
}
"""

json_desired_config = """
{
  "serial": "ABC123",
  "settings": {
  "readingsEndPoint": "https://egingestprod.azurewebsites.net/api/catm1?code=aQe4vNtSTL0lLs6iqa04Oj1pMHw/u/rSaPFZ06YaYeCal0fY4gmCXw==",
  "Wakeup": 30,
  "TransmitFreq": 1,
  "TransmitSize": 50,
  "MaxTransmits": 4   
  },
  "actions": [
  {
    "type": "SET_VARIABLES",
    "payload": {
    "FleaCount": 5,
    "MustCallHome": true,
    "MustGetInstruction": true,
    "GetTimeCountdown": 0,
    }
  },
  {
    "type": "SEND_COUNTERS"
  },
  {
    "type": "RESTART"
  }
  ]
}
"""


# MyJson = json.loads(json_desired_config)

# print( MyJson)
# print( type(MyJson))

# if 'serial' in MyJson:
#  print( 'serial: ', MyJson['serial'])


# if 'settings' in MyJson:
#  MyConfig = MyJson['settings']
#  print( 'settings: ',MyConfig )


# write a loop to go through actions.
# MyActions = MyJson['actions']
# print( MyActions)
# print( type(MyActions))

# print( 'parsing actions...')
# for MyDict in MyActions:
#  print( MyDict)
#  if 'type' in MyDict and MyDict['type']=='SET_VARIABLES':
#    if 'payload' in MyDict:
#      MyConfig=MyDict['payload']
#      print( 'Action: SET_VARIABLES:',MyConfig )
#  elif 'type' in MyDict and MyDict['type']=='SEND_COUNTERS':
#    print('Action: SEND_COUNTERS')
#  elif 'type' in MyDict and MyDict['type']=='RESTART':
#    print('Action: RESTART')
#  else:
#    print('Action unknown, increment counter')


# well thats simple, extract each section to a dict and pass through to update. Question: should a reset be intiated?
# Pro you would be booting from a clean state, Con theres really no need, rely on user to do right thing, could always
# use action to specify explicit exit. Doing a restart or partial reset or total reset would be executed immediately and
# cause the device to shut down and restart. ideally you could change settings by returning 301 to sample post and then still get the samples.
# may also want ability to send config and variable settings back to management platform?

# code:
#
SERIAL_ALPHABET = "123456789ABCDFGHJKLMNPSTWXZ"


def serial_loads(based_string):
  """ Converts integer to base27 string """
  value = 0
  radix = len(SERIAL_ALPHABET)
  based_len = len(based_string)
  for i, char in enumerate(based_string):
    power = (based_len - i) - 1
    mul = SERIAL_ALPHABET.index(char)
    value += mul * radix ** power
  return value


print(serial_loads("8N31PAD"))

# import requests

# url = 'https://device-hq.myelectricgarden.com/api/instructions/v1/ABC123'
# myobj = json.loads(json_desired_config)

# x = requests.post(url, data = myobj)

# print(x.text)


# if response.json()['serial'] == globals.SerialNumber:
#  address = response.json()['settings']['readingsEndPoint']

