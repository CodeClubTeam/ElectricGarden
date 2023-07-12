import machine
from pycom import nvs_get, nvs_set
from time import sleep_ms

def board_led(enabled=None):
    # Inverted logic, LED sinks through MCU.
    led_pin = machine.Pin('P23', mode=machine.Pin.OUT)
    if enabled is None:
        return led_pin()
    else:
        led_pin(not enabled)

def cause_counter(reset_cause):
    reason_number = str(reset_cause)
    reason_key = 'rst.' + reason_number
    counter = nvs_get(reason_key) or 0 
    return counter, reason_key

def increment_cause(reset_cause):
    counter, reason_key = cause_counter(reset_cause)
    counter += 1 
    nvs_set(reason_key, counter)

def wakeup():
    reset_cause = machine.reset_cause()
    wake_reason, wake_io = machine.wake_reason()
    increment_cause(reset_cause)
    # Reset strings
    if reset_cause == machine.PWRON_RESET:
        reset_cause = 'PWRON'
    if reset_cause == machine.HARD_RESET:
        reset_cause = 'HARD'
    if reset_cause == machine.WDT_RESET:
        reset_cause = 'WDT'
    if reset_cause == machine.DEEPSLEEP_RESET:
        reset_cause = 'DEEPSLEEP'
    if reset_cause == machine.SOFT_RESET:
        reset_cause = 'SOFT'
    if reset_cause == machine.BROWN_OUT_RESET:
        reset_cause = 'BROWN_OUT'
    # Wake strings
    if wake_reason == machine.PWRON_WAKE:
        wake_reason = 'PWRON'
    if wake_reason == machine.PIN_WAKE:
        wake_reason = 'PIN'
    if wake_reason == machine.RTC_WAKE:
        wake_reason = 'RTC'
    if wake_reason == machine.ULP_WAKE:
        wake_reason = 'ULP'
    if isinstance(wake_io, int):
        print('Wake Reason: %s:%i, Reset Cause: %s' %(wake_reason, wake_io, reset_cause))
    else:
        print('Wake Reason: %s, Reset Cause: %s' %(wake_reason, reset_cause))

    if reset_cause == 'PWRON':
        board_led(True)

    return reset_cause, wake_reason