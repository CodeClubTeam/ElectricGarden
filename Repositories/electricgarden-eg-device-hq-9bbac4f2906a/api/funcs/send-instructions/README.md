# Send Instructions

Send instructions to device

## Catm1

Sets a flag so that next time a data point is delivered,
a 301 response is used to signal to the device to fetch instructions (via http),

The flag is reset when the device retrieves the instructions.

## Lora

Queues instruction to think park for delivery.
