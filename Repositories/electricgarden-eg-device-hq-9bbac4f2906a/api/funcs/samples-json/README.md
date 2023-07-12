# Samples Json

Sample receive taking simple JSON rather than a compact serialisation format.

Not used by devices, rather test scripts.

The JSON sample will be transformed into a `SampleMessage` and sent to the EventHub
to be picked up by the `message-pump` to put on the
samples queue and later handled by a consumer of that queue (`sample-relay`).
