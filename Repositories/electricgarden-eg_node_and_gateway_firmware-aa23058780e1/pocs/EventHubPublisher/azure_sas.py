from base64 import b64encode, b64decode
from hashlib import sha256
from time import time
from hmac import HMAC
from urllib.parse import quote_plus, urlencode, quote

def generate_sas_token(uri, key, keyName, ttl=3600):
    expiry = int(time() + ttl)

    uri = quote_plus(uri)
    sas = key.encode('utf-8')
    string_to_sign = (uri + '\n' + str(expiry)).encode('utf-8')
    signed_hmac_sha256 = HMAC(sas, string_to_sign, sha256)
    signature = quote(b64encode(signed_hmac_sha256.digest()))
    return {
        'expiry': expiry,
        'token': 'SharedAccessSignature sr={}&sig={}&se={}&skn={}'.format(uri, signature, expiry, keyName)
    }