from spec import *
try: 
    import eventhub
except:
    import lib.eventhub as eventhub

class ElectricGardenSealedPackage(object):
    def __init__(self, payload, conduit):
        self.payload = payload 
        self.conduit = conduit 
    
    def dispatch(self):        
        response = self.conduit._dispatch(self)
        _ = response.content
        return response

class ElectricGardenConduitPackage(object):
    def __init__(self, conduit):
        self.conduit = conduit 
        self.gateways = {}
    
    def gateway(self, gatewayID):
        if gatewayID not in self.gateways:
            self.gateways[gatewayID] = Gateway(gatewayID)
        return self.gateways[gatewayID]
    
    def seal(self):
        payload = []
        for gatewayID, gateway in self.gateways.items():
            payload.append(gateway.serialize())
        return ElectricGardenSealedPackage(payload, self.conduit)

class ElectricGardenConduit(object):
    def __init__(self, options):
        """ Create a new Conduit, uses EventHub """
        self.eh = eventhub.EventHub(options)
    
    def preparePackage(self):
        """ Create a new EGConduitPackage so that a message can be sent to 
            Electric Garden's conduit. (Event Ingress)
        """
        return ElectricGardenConduitPackage(self)

    def _encapsulate(self, sealedPackage:ElectricGardenSealedPackage):
        """ Takes a sealed package and JSON serialize the 
            serialization ready objects, then encapsulates them in a 'Body'
            element, ready to be consumed by the Azure Event Hub
        """
        try:
            import json 
        except:
            import ujson as json 
        eventHubWrappedPayload = []
        for gatewayBlob in sealedPackage.payload:
            gatewayEncodedBlob = json.dumps(gatewayBlob)
            eventHubWrappedPayload.append({"Body": gatewayEncodedBlob})
        return eventHubWrappedPayload

    def _dispatch(self, sealedPackage:ElectricGardenSealedPackage):
        """ Dispatch the sealed package to EG Conduit """
        encapsulatedPackage = self._encapsulate(sealedPackage)
        return self.eh.publish_multiple(encapsulatedPackage)
