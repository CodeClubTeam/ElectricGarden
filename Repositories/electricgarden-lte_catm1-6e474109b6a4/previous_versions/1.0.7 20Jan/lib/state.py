import sys
import machine
from micropython import const
from pycom import nvs_get
from hw import wakeup, cause_counter
from power import power_up, power_down

GOD_OBJ = { }

STATE_WAKE = const(1)
STATE_INIT = const(2)
STATE_LOAD = const(3)
STATE_SENSOR_READ = const(4)
STATE_SENSOR_STORE = const(5)
STATE_GATEWAY_SELECT = const(6)
STATE_GATEWAY_FIND = const(7)
STATE_GATEWAY_INVALID = const(8)
STATE_DISPATCH = const(9)
STATE_DEEPSLEEP = const(10)
STATE_DIE = const(-1)
CURRENT_STATE = STATE_WAKE

def crash(reason):
    print('/!\\  FATAL CRASH  /!\\')
    if isinstance(reason, Exception):
        sys.print_exception(reason)
    else:
        print('REASON VALUE:', reason)
    sys.exit(-1)

def execute_state_function(state_fn, node):
    global CURRENT_STATE
    enter_state = CURRENT_STATE
    try:
        CURRENT_STATE = state_fn(node)
        if CURRENT_STATE == STATE_DIE:
            raise Exception('State Machine died in state: %i' %enter_state)
        if not isinstance(CURRENT_STATE, int):
            raise Exception('Invalid machine state [T]: %s' %str(CURRENT_STATE))
        if CURRENT_STATE < STATE_WAKE or CURRENT_STATE > STATE_DEEPSLEEP:
            raise Exception('Invalid machine state [V]: %i' %CURRENT_STATE)
    except Exception as reason:
        crash(reason)

def select_state_function():
    if CURRENT_STATE == STATE_WAKE:
        return state_wake
    if CURRENT_STATE == STATE_INIT:
        return state_init
    if CURRENT_STATE == STATE_LOAD:
        return state_load
    if CURRENT_STATE == STATE_SENSOR_READ:
        return state_sensor_read
    if CURRENT_STATE == STATE_SENSOR_STORE:
        return state_sensor_store
    if CURRENT_STATE == STATE_GATEWAY_SELECT:
        return state_gateway_select
    if CURRENT_STATE == STATE_GATEWAY_FIND:
        return state_gateway_find
    if CURRENT_STATE == STATE_GATEWAY_INVALID:
        return state_gateway_invalid
    if CURRENT_STATE == STATE_DISPATCH:
        return state_dispatch
    if CURRENT_STATE == STATE_DEEPSLEEP:
        return state_deepsleep
    crash(Exception('Invalid CURRENT_STATE, cannot select state function: {0}'.format(CURRENT_STATE)))

def think(node):
    state_function = select_state_function()
    execute_state_function(state_function, node)

def report_hard_reset():
    print('Reset by Physical Reset Button!')
    # TODO: IMPLEMENT ME

def report_wdt_reset():
    print('Reset by Watchdog!')
    # TODO: IMPLEMENT ME

def report_soft_reset():
    print('Reset by terminal!')
    # TODO: IMPLEMENT ME

def report_brownout_reset():
    print('Reset by Brownout!')
    # TODO: IMPLEMENT ME

def state_wake(node):
    reset_cause, wake_reason = wakeup()
     # Report unusual reset reasons
    if reset_cause == 'HARD':
        report_hard_reset()
    if reset_cause == 'WDT':
        report_wdt_reset()
    if reset_cause == 'SOFT':
        report_soft_reset()
    if reset_cause == 'BROWN_OUT':
        # Might need to special handle this one
        # If our power is browning out we might not be able to notify the user of this
        report_brownout_reset()
    GOD_OBJ['reset_cause'] = reset_cause
    GOD_OBJ['wake_reason'] = wake_reason
    return STATE_INIT

def state_init(node):
    print('[STATE] Init')
    from sensors import MANAGER, Analog
    GOD_OBJ['sensor_manager'] = MANAGER
    GOD_OBJ['bat_meter'] = Analog('P13')
    return STATE_LOAD

def state_load(node):
    manager = GOD_OBJ['sensor_manager']
    manager.load_config()
    return STATE_SENSOR_READ

def state_sensor_read(node):
    manager = GOD_OBJ['sensor_manager']
    GOD_OBJ['readings'] = {}
    power_up(GOD_OBJ['sensor_manager'])
    for sensor in manager.sensor_names():
        reading = manager.read_sensor(sensor)
        if reading is not None:
            GOD_OBJ['readings'][sensor] = reading
            print('[STATE] Sensor read: %s: %f' %(sensor, reading))
        else:
            print('[STATE] Sensor read failed: %s' %sensor)
    
    reset_pwron,_ = cause_counter(machine.PWRON_RESET)
    reset_hard,_  = cause_counter(machine.HARD_RESET)
    reset_wdt,_   = cause_counter(machine.WDT_RESET)
    reset_soft,_  = cause_counter(machine.SOFT_RESET)
    reset_brown,_ = cause_counter(machine.BROWN_OUT_RESET)
    if reset_pwron > 0:
        GOD_OBJ['readings']['rst_pwr'] = reset_pwron
    if reset_hard > 0:
        GOD_OBJ['readings']['rst_hard'] = reset_hard
    if reset_wdt > 0:
        GOD_OBJ['readings']['rst_wdt'] = reset_wdt
    if reset_soft > 0:
        GOD_OBJ['readings']['rst_soft'] = reset_soft
    if reset_brown > 0:
        GOD_OBJ['readings']['rst_brown'] = reset_brown
    
    GOD_OBJ['bat_voltage'] = GOD_OBJ['bat_meter'].voltage()
    power_down(GOD_OBJ['sensor_manager'])
    return STATE_SENSOR_STORE

def state_sensor_store(node):
    # TODO Implement
    return STATE_GATEWAY_SELECT
    pass

def state_gateway_select(node):
    # TODO Implement
    if not node.enabled():
        node.enabled(True)
    return STATE_GATEWAY_FIND
    pass

def state_gateway_find(node):
    return STATE_DISPATCH

def state_gateway_invalid(node):
    pass

def state_dispatch(node):
    node.send_readings(GOD_OBJ['readings'])
    return STATE_DEEPSLEEP

def state_deepsleep(node):
    sleep_duration = nvs_get('deepsleep')
    if sleep_duration is None:
        raise Exception('You need to set the NVRAM `deepsleep` duration')
    if isinstance(GOD_OBJ['bat_voltage'], float) and GOD_OBJ['bat_voltage'] < 0.65:
        print('Batterys not present, sleeping for 3 seconds')
        machine.deepsleep(3000)
    else:
        machine.deepsleep(sleep_duration)
