import "./vendor/promise.min.js";
import "./vendor/fetch.min.js";
import "./vendor/hashchange.js";
import moment from './vendor/moment';
// const virtualDom = require('./vendor/virtual-dom');
import diff from "virtual-dom/diff";
import patch from "virtual-dom/patch";
import createElement from "virtual-dom/create-element";
import VNode from "virtual-dom/vnode/vnode";
import VText from "virtual-dom/vnode/vtext";
import htmlToVDom from "html-to-vdom";
import templates from "./templates.js";
const parseHTML = htmlToVDom({ VNode, VText });

// Debounce redraws with 100ms delay.
let redrawHandle = 0;

// Debounce hashchange
let hashHasChanged = false;

// Root element for renderer, this doesn't exist until the first render.
let rootElement = null;

let lastTree = null;

function _handleAPIResponse(promise) {
  return promise
    .then(response => {
      if (response.headers.get('content-type') && response.headers.get('content-type').indexOf('application/json') === -1) {
        return Promise.reject('Unexpected content type.')
      } else {
        return response.json()
      }
    })
    .then(json => {
      Object.keys(json).forEach(key => updateContext(key, json[key]))
    })
    .catch(error => {
      console.log("Ajax fetch failure", error);
    });
}

// Intercept handler
function _formInterceptHandler(submitEvent) {
  submitEvent.preventDefault();
  const formData = new FormData(this);
  const target = this.attributes["action"].value;
  const method = this.attributes["method"].value;
  const trip = this.attributes["trip"] && this.attributes["trip"].value || false;
  const aftersubmit = this.attributes["aftersubmit"] && this.attributes["aftersubmit"].value;
  if (method.toUpperCase() !== "GET") {
    formData.append("csrftoken", context.status.csrf);
  }
  if (trip) {
    updateContext(trip, true)
  }
  _handleAPIResponse(
    fetch(target, {
      headers: {
        'accept': 'application/json'
      },
      referrer: 'no-referrer',
      cache: 'no-cache',
      mode: 'no-cors',
      method: method,
      body: method.toUpperCase() !== "GET" ? formData : null
    })
  ).then(done => {
    if(trip) { updateContext(trip, false) }
    if(aftersubmit) { window[aftersubmit](); }
  })
}

// Intercept forms
function interceptForms() {
  const forms = document.querySelectorAll("form[action]");
  forms.forEach(form => {
    if (!form.onsubmit) {
      console.log("Intercept form", form);
      form.onsubmit = _formInterceptHandler;
    }
  });
}

function wifi_configure(ssid, bssid) {
  updateContext("configure_wlan", {
    ssid: ssid,
    bssid: bssid,
    step: "config",
    dhcp: true
  });
}

function wifi_toggle_dhcp() {
  updateContext('configure_wlan.dhcp', !window.context.configure_wlan.dhcp)
}

function wifi_configure_disengage() {
  updateContext("configure_wlan", null);
}

window.wifi_configure = wifi_configure
window.wifi_toggle_dhcp = wifi_toggle_dhcp
window.wifi_configure_disengage = wifi_configure_disengage

// Parse handlebars rendered HTML in to a VDom AST (VTree)
function parseHandlebars(template, context) {
  const html = `<main id="content">${template(context)}</main>`;
  return parseHTML(html);
}

function renderTemplateToDOM(template, context) {
  // This is why people just use React instead of rolling their own, its never faster - screaming.
  const vtree = parseHandlebars(template, context);
  if (rootElement === null) {
    const contentElement = document.getElementById("content");
    lastTree = parseHTML(contentElement.outerHTML);
    rootElement = createElement(lastTree);
    const wrapper = contentElement.parentElement;
    wrapper.replaceChild(rootElement, contentElement);
  }
  const patches = diff(lastTree, vtree);
  rootElement = patch(rootElement, patches);
  lastTree = vtree;
}

function applyTemplate(name) {
  if (!templates[name]) {
    console.log("Missing template", name);
    document.getElementById("content").innerHTML = `
      <h1>Error occurred navigating to '${name}' page.</h1>
      <h3>This page could not be found. Go back to the previous page, home page or refresh the browser.</h3>
    `;
  } else {
    renderTemplateToDOM(templates[name], window.context);
    if (hashHasChanged) {
      if (_afterHashChangeInvokes[name]) {
        console.log("Invoking after hash change scripts");
        _afterHashChangeInvokes[name]();
      }
    }
    interceptForms();
  }
  hashHasChanged = false;
}

function redraw() {
  if (redrawHandle) {
    clearTimeout(redrawHandle);
    redrawHandle = 0;
  }
  redrawHandle = setTimeout(() => {
    redrawHandle = 0;
    const hashSymbol = window.location.hash;
    const hash = hashSymbol.substring(1);
    applyTemplate(hash);
  }, 100);
}

function handleHashChange() {
  const hashSymbol = window.location.hash;
  if (!hashSymbol) {
    /* Redirect to #landing so that we can continue our lives */
    window.location.hash = "#landing";
    return;
  }
  hashHasChanged = true;
  const hash = hashSymbol.substring(1);
  // Update the sidebar.
  document.getElementById("sidebar").childNodes.forEach(child => {
    if (child.nodeName.toUpperCase() == "A") {
      const childHref = child.href;
      const childHash =
        childHref.indexOf("#") > 0 ? childHref.split("#", 2)[1] : "";
      if (childHash == hash) {
        child.setAttribute("active", "");
      } else {
        child.removeAttribute("active");
      }
    }
  });
  applyTemplate(hash);
}

function updateContext(path, value) {
  const pathList = path.split(".");
  let parent = window.context;
  for (var i = 0; i < pathList.length - 1; i += 1) {
    if (!parent[pathList[i]]) {
      if (!isNaN(parseInt(pathList[i+1]))) {
        parent[pathList[i]] = []
      } else {
        parent[pathList[i]] = {}
      }
    }
    parent = parent[pathList[i]];
  }
  parent[pathList[pathList.length - 1]] = value;
  redraw();
}

function transformStatusUpdate(status) {
  if (status.sn && status.sn.nodes) {
    for (let node of status.sn.nodes) {
      if (node.time) {
        node.ago = moment.unix(node.time).fromNow()
      }
    }
  }
  return status
}

function updateGatewayStatus() {
  fetch("/data/status")
    .then(response => response.json())
    .then(json => {
      json = transformStatusUpdate(json)
      updateContext("status", json)
    })
    .then(noerr => {
      updateContext("error", null);
    })
    .catch(err => {
      console.log("Error occurred fetching status");
      updateContext("error", err);
    })
    .then(done => {
      setTimeout(() => updateGatewayStatus(), 10000);
    });
}

var _afterHashChangeInvokes = {
  landing: function() {
    updateContext("gettingConfiguration", true);
    fetch("/data/config")
      .then(response => response.json())
      .then(configuration => {
        updateContext("config", configuration);
        /*
        if (configuration.sta) {
            document.getElementById('sta_ssid').value = configuration.sta.ssid;
            document.getElementById('sta_dhcp').checked = configuration.if === 'dhcp'
            if (configuration.if !== 'dhcp') {
                document.getElementById('sta_ip').value = configuration.if.ip
                document.getElementById('sta_gateway')
            }
        }
        */
      })
      .catch(err => updateContext("error", err))
      .then(() => {
        updateContext("gettingConfiguration", false);
      });
  }.bind(window),
  reboot: function() {
    window.systemCheckHandle =
      window.systemCheckHandle ||
      setInterval(() => {
        console.log("Check if the gateway is up.");
        if (window.context.error == null) {
          fetch("/data/status")
            .then(response => response.json())
            .then(json => {
              if (json && json.ap.status === "Up") {
                clearInterval(window.systemCheckHandle);
                window.location.href = "/";
              }
            })
            .catch(err => {
              window.context.error = null;
            });
        }
      }, 5000);

    function rebootIsSlow() {
      window.slowReboot = true;
      delete window.rebootTime;
      updateContext("rebootSlow", true);
    }

    function updateProgressBar() {
      const elapsedSeconds = Math.floor(
        (Date.now() - window.rebootTime) / 1000
      );
      // This is a poor use of conditionals, feels bad.
      if (elapsedSeconds > 60) {
        rebootIsSlow();
      } else if (elapsedSeconds < 31) {
        updateContext("rebootProgress", elapsedSeconds);
        setTimeout(() => updateProgressBar(), 1000);
      } else {
        document.getElementById("progressRebooting").removeAttribute("value");
        setTimeout(() => updateProgressBar(), 1000);
      }
    }
    /* We aren't in a slow reboot state, so we must have just loaded the page. */
    if (!window.rebootTime && !window.slowReboot) {
      window.rebootTime = Date.now();
      setTimeout(() => updateProgressBar(), 1000);
    }
  }.bind(window),
  status: function() {}.bind(window)
};

(function() {
  window.context = {
    webVersion: "1.0.0",
    status: null
  };
  window.onhashchange = handleHashChange;
  window.addEventListener("load", () => {
    handleHashChange();
    updateGatewayStatus();
  });
})();
