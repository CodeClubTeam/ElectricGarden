# Lora Receiver

This handler is meant to take all requests from Thing Park.

It will look at the first few bytes of the payload from Thing Park and decide
what sort of message it is.

Message types might include samples, counters, errors.

It will then decode the payload into a standard JSON shape (TBA) with message type property included
and send it to the Event Hub for later processing.
