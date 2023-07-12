# Message Pump

This handler is purely to take messages off the Event Hub and route them to the appropriate
Azure storage queue for processing.

For samples, it splits them up into one message for each sample
so each is handled independently (e.g. in retries etc).
