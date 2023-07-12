import time
import urllib.parse
import hmac
import hashlib
import base64

def get_auth_token(sb_name, eh_name, sas_name, sas_value):
    """
    Returns an authorization token dictionary 
    for making calls to Event Hubs REST API.
    """
    uri = urllib.parse.quote_plus("https://{}.servicebus.windows.net/{}" \
                                  .format(sb_name, eh_name))
    sas = sas_value.encode('utf-8')
    expiry = str(int(time.time() + 10000))
    string_to_sign = (uri + '\n' + expiry).encode('utf-8')
    signed_hmac_sha256 = hmac.HMAC(sas, string_to_sign, hashlib.sha256)
    signature = urllib.parse.quote(base64.b64encode(signed_hmac_sha256.digest()))
    return  {"sb_name": sb_name,
             "eh_name": eh_name,
             "token":'SharedAccessSignature sr={}&sig={}&se={}&skn={}' \
                     .format(uri, signature, expiry, sas_name)
            }

print(get_auth_token(
    'eg-event-ingress',
    'sensorhub',
    'SendOnlySAS',
    'QYRzsWj9jN93NZdt4lALbhx/9DkvEAyTAZ7rmJRcUjM='
)['token'])
            
    # 'endpoint': 'eg-event-ingress.servicebus.windows.net',
    # 'keyname': 'SendOnlySAS',
    # 'key': 'QYRzsWj9jN93NZdt4lALbhx/9DkvEAyTAZ7rmJRcUjM=',
    # 'url': 'https://eg-event-ingress.servicebus.windows.net/sensorhub/messages'