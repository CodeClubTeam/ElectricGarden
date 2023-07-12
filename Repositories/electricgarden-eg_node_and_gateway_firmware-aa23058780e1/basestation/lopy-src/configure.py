from json import loads, dumps
import util

_confDir = '/flash/conf'
_config = 'system'

class Configuration:

    def __init__(self, confName=_config, confDir=_confDir):
        self._filePath = '%s/%s.json' % (confDir, confName)
        self.load()

    def _initalizeEmpties(self):
        # Locally cached config object
        Lconf = self._confObj
        modified = False
        # Timezone and NTP configuration
        if Lconf.get('tz', None) is None:
            Lconf['tz'] = {
                'ntp': 'pool.ntp.org',  # NTP Server
                'timezone': 12 * 3600  # GMT+12
            }
            modified = True

        # Device identification (Empty to begin with)
        if Lconf.get('id', None) is None:
            Lconf['id'] = {
                'gw': None,  # Unique Gateway ID
                'org': None,  # Organization this device belongs to
                'key': None,  # A key if required to post to the server
                'modified': 0  # Last time this was modified
            }
            modified = True

        # Conduit Configuration (Empty to begin with)
        if Lconf.get('conduit', None) is None:
            Lconf['conduit'] = {
                'endpoint': None,  # Endpoint URL
                'key': None,  # Key
                'keyName': None,  # Key Name
                'url': None  # Message Delivery URL
            }
            modified = True

        # First time setup options
        if Lconf.get('ftsetup', None) is None:
            Lconf['ftsetup'] = {
                'apName': 'electric-garden-%s' % util.serial(),
                'apKey': 'setup123',
                'apIP': '192.168.0.1'
            }
            modified = True

        # DNS server
        if Lconf.get('dns', None) is None:
            Lconf['dns'] = {
                'list': {
                    'gateway.electricgarden.nz': '192.168.0.1'
                }
            }
            modified = True

        # Some defaults were applied, save the config.
        if modified:
            self.save()

    def setting(self, path):
        node = self._confObj
        for child in path.split('.'):
            node = node.get(child, None)
            if node is None:
                return None
        return node

    def load(self):
        try:
            with open(self._filePath, 'r') as jsonFile:
                self._confObj = load(jsonFile)
        except:
            self._confObj = {}
        self._initalizeEmpties()

    def save(self):
        try:
            jsonStr = dumps(self._confObj)
            try:
                mkdir(self._confPath)
            except:
                pass
            with open(self._filePath, 'wb') as jsonFile:
                jsonFile.write(jsonStr)
            return True
        except:
            return False


configuration = Configuration()
