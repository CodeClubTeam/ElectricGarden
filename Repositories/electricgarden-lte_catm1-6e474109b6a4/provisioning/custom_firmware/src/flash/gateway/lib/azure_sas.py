import gc
from base64 import b64encode
gc.collect()
from hashlib import sha256
gc.collect()
from time import time
gc.collect()
from hmac import HMAC
gc.collect()
from urllib.parse import quote_plus, quote

def generate_sas_token(uri, key, keyName, ttl=3600):
    expiry = int(time() + ttl)

    print('XX1')
    uri = quote_plus(uri)
    print('XX2')
    sas = key.encode('utf-8')
    print('XX3')
    string_to_sign = (uri + '\n' + str(expiry)).encode('utf-8')
    print('XX4')
    signed_hmac_sha256 = HMAC(sas, string_to_sign, sha256)
    print('XX5')
    signature = quote(b64encode(signed_hmac_sha256.digest()))
    print('XX6')
    print('SAS Token Make complete.')
    return {
        'expiry': expiry,
        'token': 'SharedAccessSignature sr={}&sig={}&se={}&skn={}'.format(uri, signature, expiry, keyName)
    }