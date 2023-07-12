# Catm1 Receiver

This receiver receives sample payloads directly from G01 devices via HTTP
and converts them into standard SampleMessages putting them on the Event Hub
for processing.

This SampleMessage will then be picked up by the `message-pump` to put on the
samples queue and later handled by a consumer of that queue (`sample-relay`).
