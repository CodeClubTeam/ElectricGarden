import urequests
import azure_sas
import json
from time import time as seconds 

class EventHub:
    def __init__(self, options):
        self.endpoint = options['endpoint'] # Endpoint without post URL on the end. From Connection String 
        self.keyname = options['keyname'] # Endpoint Key Name. From Connection String 
        self.key = options['key'] # Endpoint Key, From Connection String 
        self.url = options['url'] # Complete POST URL for messages
        self.token = None 
        self.tokenExpires = None

    def make_token(self):
        """
        Returns an authorization token dictionary 
        for making calls to Event Hubs REST API.
        """
        if self.token is None or self.tokenExpires < seconds():
            token_gen = azure_sas.generate_sas_token(self.endpoint, self.key, self.keyname)
            self.tokenExpires = token_gen['expiry']
            self.token = token_gen['token']
    
    def publish_single(self, payload, userProperties=None, brokerProperties=None):
        if userProperties is not None or brokerProperties is not None:
            encapsulatedPayload = {
                'Body': payload
            }
            if userProperties is not None:
                encapsulatedPayload['UserProperties'] = userProperties
            if brokerProperties is not None: 
                encapsulatedPayload['BrokerProperties'] = brokerProperties
            return self.publish_multiple([encapsulatedPayload])
        return self.publish_multiple([{'Body': payload}])

    def publish_multiple(self, payloads):
        self.make_token()
        headers = {
            'Content-Type': 'application/vnd.microsoft.servicebus.json',
            'Authorization': self.token,
            'x-ms-retrypolicy': 'NoRetry'
        }
        uri = self.url + '?timeout=60&api-version=2014-01'
        try:
            import json as ujson
        except:
            import ujson
        payload = ujson.dumps(payloads).encode('utf-8')
        print('EventBus Publish')
        print(headers)
        print(payload)
        return urequests.post(uri, headers=headers, data=payload)


