# Before switching to vDOM

"""
Invoking after hash change scripts
basestation-www.js:20 Render took 8.90000001527369 milliseconds, and updated the whole DOM.
basestation-www.js:20 Render took 0.4000000189989805 milliseconds, and updated the whole DOM.
basestation-www.js:20 Render took 0.6000000284984708 milliseconds, and updated the whole DOM.
basestation-www.js:20 Render took 1.9999999785795808 milliseconds, and updated the whole DOM.
/#landing:1 This page includes a password or credit card input in a non-secure context. A warning has been added to the URL bar. For more information, see https://goo.gl/zmWq3m.
basestation-www.js:20 Render took 1.1999999405816197 milliseconds, and updated the whole DOM.
basestation-www.js:20 Invoking after hash change scripts
basestation-www.js:20 Render took 2.79999990016222 milliseconds, and updated the whole DOM.
basestation-www.js:20 Render took 2.79999990016222 milliseconds, and updated the whole DOM.
basestation-www.js:20 Render took 1.500000013038516 milliseconds, and updated the whole DOM.
basestation-www.js:20 Invoking after hash change scripts
basestation-www.js:20 Render took 5.799999926239252 milliseconds, and updated the whole DOM.
basestation-www.js:20 Render took 0.599999912083149 milliseconds, and updated the whole DOM.
VM2350:1 GET http://gateway.electricgarden.nz/data/config 0 ()
(anonymous) @ VM2350:1
(anonymous) @ VM2411:3
(anonymous) @ basestation-www.js:20
applyTemplate @ basestation-www.js:20
handleHashChange @ basestation-www.js:20
VM2350:1 GET http://gateway.electricgarden.nz/data/status 0 ()
(anonymous) @ VM2350:1
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
load (async)
require.8../vendor/promise.min.js @ basestation-www.js:20
t @ basestation-www.js:1
require.14 @ basestation-www.js:1
(anonymous) @ basestation-www.js:1
basestation-www.js:20 Error occurred fetching status
basestation-www.js:20 Render took 1.7000000225380063 milliseconds, and updated the whole DOM.
VM2350:1 GET http://gateway.electricgarden.nz/data/status 0 ()
(anonymous) @ VM2350:1
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
setTimeout (async)
(anonymous) @ basestation-www.js:20
Promise.then (async)
updateGatewayStatus @ basestation-www.js:20
(anonymous) @ basestation-www.js:20
load (async)
require.8../vendor/promise.min.js @ basestation-www.js:20
t @ basestation-www.js:1
require.14 @ basestation-www.js:1
(anonymous) @ basestation-www.js:1
basestation-www.js:20 Error occurred fetching status
basestation-www.js:20 Render took 5.699999979697168 milliseconds, and updated the whole DOM.
basestation-www.js:20 Render took 2.6000000070780516 milliseconds, and updated the whole DOM.
"""