/*
{
  "GID": string, // Gateway ID
  // Node ID
  "NID": [{
      "T": string, // Date Time
      ":light": string, // Sensor reading
      ":temp": string, // Sensor reading
      ":humidity": string, // "
      ":moisture": string, // "
  }]
}
*/

// 30 minutes
const PartitionQuantization = 1800

function QuantizeTimeStamp(timestampSeconds, quantization) {
    return quantization * Math.floor(timestampSeconds / quantization)
}

// Flips Timestamps so the database naturally orders records in decending order. 
// This will make queries for more recent data faster than queries for older data ;)
// This will fail and cause a systemic failure at precisely midnight, Jan 1, 2100, UTC. Good luck.  
function ReverseTimestamp(timestampSeconds) {
    const HighSide = 4102444800 // 01/01/2100 @ 12:00am (UTC)
    return HighSide - timestampSeconds
}

function NowSeconds() {
    return Math.round(Date.now() / 1000)
}

function CreateRecord(GatewayID, NodeID, ReadingTimestampSeconds, Organization, ReadingsDictionary) {
    // I'm not sure if Reverse(Quantize), is the same as Quantize(Reverse). I suspect it isn't.
    // I also suspect that I wish to Quantize first.
    // const ReversedPartitionSeconds = ReverseTimestamp(ReadingTimestampSeconds)
    let PartitionView = '30m' // Each partition stores 30 minutes of sensor events, row stores 5 minutes
    let PartitionKey = `${PartitionView}__${ReverseTimestamp(QuantizeTimeStamp(ReadingTimestampSeconds, PartitionQuantization))}`
    // Row Keys need to be unique. So I'll not quantize the RowKey, keeping all the seconds. 
    // To make it smaller I can drop off the partition key part. 
    let RowKeySecondsOffset = ReadingTimestampSeconds - QuantizeTimeStamp(ReadingTimestampSeconds, PartitionQuantization)
    let RowKeySecondsPadded = `${RowKeySecondsOffset}`.padStart(4, '0')
    let RowKey = `${RowKeySecondsPadded}__${NodeID}`

    let Record = {}
    for (let SensorKey of Object.keys(ReadingsDictionary)) {
        Record[SensorKey] = ReadingsDictionary[SensorKey]
    }
    Record.PartitionKey = PartitionKey
    Record.RowKey = RowKey
    Record.When = ReadingTimestampSeconds
    Record.GatewayID = GatewayID
    Record.NodeID = NodeID
    Record.Organization = Organization
    return Record
}

function ParseTimestamp(timestamp) {
    const secondsEpoch = parseInt(timestamp)
    if (isNaN(secondsEpoch)) {
        // We presume its a parsable string then
        return Math.floor(Date.parse(timestamp) / 1000) // Divide milliseconds to seconds 
    } // Else it is seconds epoch 
    return secondsEpoch
}

module.exports = function (context, eventHubMessage) {

    context.bindings.table = []
    let announce = eventHubMessage;

    let GatewayID = announce['GID']
    let Organization = announce['ORG']
    if (announce['HB']) {
        let HeartbeatPayload = announce['HB']
        let HeartbeatTime = 0
        try {
            HeartbeatTime = ParseTimestamp(HeartbeatPayload)
            if (isNaN(HeartbeatTime)) {
                HeartbeatTime = ParseTimestamp(JSON.parse(HeartbeatPayload)['now'])
            }
        } catch (ex) {
            HeartbeatTime = ParseTimestamp(JSON.parse(HeartbeatPayload)['now'])
        }
        context.log('Heartbeat Payload', HeartbeatPayload, 'Heartbeat Time', HeartbeatTime)
        let PartitionView = 'HB'
        let PartitionKey = `${PartitionView}__${ReverseTimestamp(QuantizeTimeStamp(HeartbeatTime, PartitionQuantization))}`
        // Row Keys need to be unique. So I'll not quantize the RowKey, keeping all the seconds. 
        // To make it smaller I can drop off the partition key part. 
        let RowKeySecondsOffset = HeartbeatTime - QuantizeTimeStamp(HeartbeatTime, PartitionQuantization)
        let RowKeySecondsPadded = `${RowKeySecondsOffset}`.(4, '0')
        let RowKey = `${RowKeySecondsPadded}__${GatewayID}`
        let record = {}
        record.PartitionKey = PartitionKey
        record.RowKey = RowKey
        record.Organization = Organization
        record.GatewayID = GatewayID
        record.Heartbeat = HeartbeatPayload
        context.bindings.table.push(record)
        context.log('Push Heartbeat, P/RK', record.PartitionKey, record.RowKey)
    }
    // context.log(`Annoucement: ${JSON.stringify(announce, undefined, 2)}`);
    for (let NodeID of Object.keys(announce).filter((propertyName) => !['GID', 'ORG', 'HB'].includes(propertyName))) {
        for (let SensorEvent of announce[NodeID]) {
            // If the timestamp is a number, then we expect it to be a seconds epoch 
            // Otherwise it'll be a string in the form of a parsable date.
            let When = ParseTimestamp(SensorEvent.T) // Date.parse returns milliseconds 
            if (isNaN(When)) {
                throw Error(`Failed to parse timestamp ${SensorEvent.T}. Cannot process message.`)
            }
            let Readings = {}
            for (let SensorName of Object.keys(SensorEvent).filter(propertyName => propertyName[0] == ':')) {
                Readings[SensorName.substring(1)] = SensorEvent[SensorName]
            }
            let record = CreateRecord(GatewayID, NodeID, When, Organization, Readings)
            context.bindings.table.push(record)
            context.log('Push Event, P/RK', record.PartitionKey, record.RowKey)
        }
    }
    context.done();
};