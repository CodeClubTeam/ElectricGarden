const Interpreter = require('./lib/interpreter')
const serializer = require('./lib/serialize')
const fs = require('fs')


/* A request from the VM to yield (hibernate and come back later with some more data) */
var yieldRequest = null;


function getStudentCodeFromDatabase() {
    /* In a function app, the student source code would be stored in a database
     * we just fetch it from the file system
     * ! We should track student code versions on server, and not resume execution if code has been modified. 
     */
    return fs.readFileSync('student_code.js').toString('utf8')
}

function getStudentVMState() {
    try {
        /* There are better formats to store JS objects in, we could consider those too */
        return JSON.parse(fs.readFileSync('student_vm.json').toString('utf8'))
    } catch (ex) {
        console.log('[VM] Student has no VM, will make new one')
        return null 
    }
}

function setStudentVMState(state) {
    try {
        const json = JSON.stringify(state)
        const size = json.length
        fs.writeFileSync('student_vm.json', JSON.stringify(state))
        return size
    } catch (ex) {
        console.log('[VM] Student VM failed to serialize. Could not hibernate.')
        return null
    }
}

function deleteVMState() {
    fs.unlink('student_vm.json', (err) => console.log('[VM] Student VM removed'))
}

function createNewVirtualMachine() {
    /* Init function to setup code scope, we can put variables and functions in scope so students can interact with it */
    function interpreterInit(interpreter, scope) {
        console.log('[VM] Init new')
    
        function getSensorData(sensor, cb) {
            console.log('getSensorData invoked', sensor, cb)
            yieldRequest = {f: 'getSensorData', a: [...arguments]}
        }
        
        function log(argument) {
            console.log('[Student Log]', argument);
        }

        // Provide a log function to students 
        interpreter.setProperty(scope, 'log', 
            interpreter.createNativeFunction(log))
    
        // Provide a getSensorData function to students
        // This function uses async logic, and will exploit our yield.
        interpreter.setProperty(scope, 'getSensorData', 
            interpreter.createAsyncFunction(getSensorData));
    }

    const code = getStudentCodeFromDatabase()
    const interpreter = new Interpreter(code, interpreterInit)
    return interpreter
}

function loadStudentVM() {
    const vm = createNewVirtualMachine()
    /* If there is a frozen state, we need to recover it */
    const vmstate = getStudentVMState()
    if (vmstate != null) {
        console.log('[VM] Restoring state from hibernation...')
        serializer.deserialize(vmstate, vm)
        console.log('[VM] Restored')
    }
    return vm;
}

function saveStudentVM(vm) {
    const vmstate = serializer.serialize(vm)
    const result = setStudentVMState(vmstate)
    if (result == null) {
        console.log('[VM] Save failure :(')
    } else {
        console.log('[VM] Saved, size:', result, 'bytes')
    }
    return result
}

function RunJSVMInterpreter(vm) {
    /* Runs the students code */
    const BATCH_CYCLES = 100 // How many VM cpu cycles should be performed before this interpreter returns to the host machine 
    const MAX_TOTAL_CYCLES = 10000 // How many VM cpu cycles can be performed before the VM is killed. Prevents infinite loops.
    if (typeof vm.cycles != 'number') {
        vm.cycles = 0
        console.log('[VM] Cycles reset to 0')
    }
    for(let cycle = 0; cycle < BATCH_CYCLES; cycle++) {
        if (vm.cycles >= MAX_TOTAL_CYCLES) {
            console.log('[VM] Max cycles exceeded, did the student make an infinite loop?')
            return
        }
        if (vm.paused_) {
            /* Asyncronously blocked, we should check the yieldRequest
            * if yieldRequest is set, then we need to save state and exit
            */
            if (yieldRequest != null) {
                console.log('[VM] Request to yield!', yieldRequest)
                saveStudentVM(vm)
                return // Exit without scheduling another run.
            }
        } else {
            const moreCodeRemains = vm.step()
            if (!moreCodeRemains) {
                deleteVMState()
                console.log('[VM] Student code has finished executing, final result:', vm.value)
                return
            } else {
                vm.cycles++
            }
        }
    }
    // We can freeze store the VM here and do a couple things
    // We can recover if we crash
    // We can prevent memory bloat, in case a student tries to allocate massive strings for example
    const vmMemoryFootprint = saveStudentVM(vm)
    console.log('[VM Doctor] Total Cycles:', vm.cycles, 'Memory footprint:', vmMemoryFootprint, 'bytes')
    // If the code falls through to here, we schedule that the code run again.
    // On a Function App, this might be after some delay, though really we could run it immediately.
    setImmediate(RunJSVMInterpreter, vm)
}

function main() {
    // We should intialize the VM for the student.
    const vm = loadStudentVM()
    // By passing an argument in to this program, it will be used as the return value for a yield
    if (vm.paused_) {
        commandArguments = process.argv.slice(2);
        if (commandArguments.length > 0) {
            console.log('[VM] Yield result:', commandArguments[0])
            vm.stateStack[vm.stateStack.length - 1].value = commandArguments[0]
            vm.paused_ = false
        } else {
            console.log('[VM] I expected a yield result, I\'m going to quit.')
            return
        }
    }
    setImmediate(RunJSVMInterpreter, vm)
}

process.on('exit', () => {
    console.log('[VM] VM has quit. Goodbye.')
})

main()