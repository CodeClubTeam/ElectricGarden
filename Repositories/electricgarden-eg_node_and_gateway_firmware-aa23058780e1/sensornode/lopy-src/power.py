from machine import Pin
from time import sleep_ms

def _power_powered_sensors(sensors):
    for sensor, sensor_config in sensors.items():
        if ':power' in sensor_config:
            yield (sensor, sensor_config[':power'])
        if 'bus' in sensor_config:
            yield (sensor, sensor_config['bus'])

def _power_energize(peripheral, energize):
    inverted = False
    if 'inverted' in peripheral and peripheral['inverted'] is True:
        inverted = True
    pin_state = energize != inverted
    peripheral_pin = peripheral['pin']
    power_pin = Pin(peripheral_pin, mode=Pin.OUT)
    power_pin(pin_state)

def _power_sensor_energy(sensors, peripherals, energize):
    deduped_peripherals = set()
    for sensor, peripheral_name in _power_powered_sensors(sensors):
        if peripheral_name not in peripherals:
            print('CONFIG ERROR, Peripheral config for P:', peripheral_name, 'S:', sensor, 'is missing.')
        elif peripheral_name not in deduped_peripherals:
            peripheral = peripherals[peripheral_name]
            _power_energize(peripheral, energize)
            deduped_peripherals.add(peripheral_name)

def _power_hold_power_state(hold_config, holding):
    for pin, state in hold_config.items():
        hold_pin = Pin(pin, mode=Pin.OUT)
        hold_pin.value(state)
        hold_pin.hold(holding)

def _power_deepsleep_hold_pins(deepsleep, holding):
    holds = deepsleep['hold']
    _power_hold_power_state(holds, holding)

def power_up(sensor_manager):
    config = sensor_manager.config
    sensors, peripherals, deepsleep = config['sensors'], config['power']['peripheral'], config['power']['deepsleep']
    _power_deepsleep_hold_pins(deepsleep, False)
    _power_sensor_energy(sensors, peripherals, True)

def power_down(sensor_manager):
    config = sensor_manager.config
    sensors, peripherals, deepsleep = config['sensors'], config['power']['peripheral'], config['power']['deepsleep']
    _power_sensor_energy(sensors, peripherals, False)
    _power_deepsleep_hold_pins(deepsleep, True)