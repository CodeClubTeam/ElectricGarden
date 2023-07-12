# Sample Receiver

Receives samples from Device HQ and inserts them into the database.

Device HQ is running off a queue so this function needs
to verify the insert succeeded and return an error HTTP status if it didn't
(in which case Device HQ will retry).