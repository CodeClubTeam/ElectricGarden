import random
from conduit import ElectricGardenConduit

ConduitConfig = {
    'endpoint': 'https://eg-event-ingress.servicebus.windows.net/sensorhub',
    'keyname': 'SendOnlySAS',
    'key': 'QYRzsWj9jN93NZdt4lALbhx/9DkvEAyTAZ7rmJRcUjM=',
    'url': 'https://eg-event-ingress.servicebus.windows.net/sensorhub/messages'
}

egConduit = ElectricGardenConduit(ConduitConfig)

def utc_now(deltaSeconds:float=0):
    import datetime 
    return (datetime.datetime.now() + datetime.timedelta(seconds=deltaSeconds)).isoformat()


def generate_test_payload():
    package = egConduit.preparePackage()

    package \
        .gateway('G0001') \
            .node('N0001') \
                .moment(utc_now()).sensor(':temp', 25) \
                .moment.sensor(':moisture').value(80) \
                .moment.sensor(':humidity').value(65) \
                .moment.sensor(':light', 1200) \
            .node \
                .moment(utc_now(-60)).sensor(':temp', 23) \
        .gateway \
            .node('N0002') \
                .moment(utc_now()).sensor(':motion', 0)
    package \
        .gateway('G0002') \
            .node('N0003') \
                .moment(utc_now(-120)).sensor(':temp', 18) \
                .moment.sensor(':moisture', 60) \
                .moment.sensor(':humidity', 12)
    
    return package.seal()

if __name__ == '__main__':
    print("Dispatching test payload")
    def dispatch():
        sealedPackage = generate_test_payload()
        response = sealedPackage.dispatch()
        print(response)

    dispatch()