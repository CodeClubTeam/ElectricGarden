from .Analog import Analog
class LightSensor(Analog):

    name = "Light sensor"
    description = "On-Board ElectricGarden light sensor"

    def __init__(self, analog_pin):
        Analog.__init__(self, analog_pin)