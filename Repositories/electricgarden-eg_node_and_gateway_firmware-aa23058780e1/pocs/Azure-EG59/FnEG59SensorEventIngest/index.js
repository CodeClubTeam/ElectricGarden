module.exports = function (context, queuedSensorEvent) {
    context.log('JavaScript queue trigger function processed work item', queuedSensorEvent.EventTime);
    //
    context.done();
};