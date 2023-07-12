log("Hello world")
// We can do loops
for (var i = 0; i < 20; i++) {
    log("Counting! " + i)
}

function weCanMakeFunctions(arg) {
    // getSensorData is a function outside of the JS virtual machine 
    // When our host program (function app) hits this, it will set a flag
    // This flag will serialize the VM state, save it, and then fire the request off for the data needed.
    // When the data is available, a new VM will be started (we simulate this by terminating the process)
    // and the result will be pushed in to the JS VM stack. the VM will then continue.
    var result = getSensorData(arg)
    log("I went to sleep and when I came back, I saw: " + result)
}

weCanMakeFunctions('async')

// Strange enough, a student code block COULD return a result, not sure if they need to though.
result="All done"