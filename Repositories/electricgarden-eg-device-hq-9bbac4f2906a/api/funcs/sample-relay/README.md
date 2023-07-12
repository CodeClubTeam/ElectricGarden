# Sample Relay

This new handler is meant to take samples off the sample queue
and relay them to the sample receiver endpoint on the environment the device is configured for.

It will most likely be an HTTP call but first it will have to look up the device settings
to ensure the right endpoint is sent to.

Because of the way the Azure Storage queues work for subscribers,
if this fails to send (e.g. HTTP error response) it will get retried several times
before going into poison queue.

## Multi Delivery

Relay endpoints can be multiple (e.g. QR code app and EG app).

The configuration for these is set up as a string.
For multiple it is a `;` separated string.

If there is only one relay endpoint, this function delivers it immediately via POST.

If there are multiple then we need to ensure each endpoint is retried independently so
instead we put an item onto a multi-delivery queue one queued delivery job per endpoint.
