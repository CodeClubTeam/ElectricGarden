# Event Hubs plus Azure Storage Queues

I inherited this architecture in the app back end where:

1. Samples come in via HTTP to an Azure Function which decodes and delivers them to Event Hub
2. Another Azure Function (was called tee, I renamed to message-pump) listens to Event Hub
   and just pushes the messages onto an Azure Storage Queue.
3. Then a Point Inserter Azure Function listens to the Azure Storage Queue and writes
   the items to CosmosDB Points collection for consumption by the app.

I wasn't sure why we needed the "middleman" of the Azure Storage Queue but I think I understand now.
If the Point Inserter was directly listening to Event Hub and failed, then data points could get lost.
This is because Event Hub isn't designed for retries, rather forward only scaling.
Azure Storage Queue binding will retry several times if the consuming function fails and then dump in the poison queue.

See https://hackernoon.com/reliable-event-processing-in-azure-functions-37054dc2d0fc for more in-depth
details on Event Hub with Azure Functions.

I still wonder if Event Hub is over-engineering for early needs with dozens (not thousands) of hardware devices.
On the other hand it's not expensive or difficult to use.

NOTE: We did have an issue where Event Hub on dev stopped working due to the queues being recreated
and not binding back properly. We got no notifications of this, the event hub became a quiet /dev/null sink.
