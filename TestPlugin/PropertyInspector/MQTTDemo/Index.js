var websocket = null,
    uuid = null,
    actionInfo = {},
    inInfo = {},
    runningApps = [],
    isQT = navigator.appVersion.includes('QtWebEngine');

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inUUID;
    actionInfo = JSON.parse(inActionInfo); // cache the info
    inInfo = JSON.parse(inInfo);
    websocket = new WebSocket('ws://localhost:' + inPort);

    addDynamicStyles(inInfo.colors);
    refreshSettings(actionInfo.payload.settings);

    websocket.onopen = function () {
        var register = {
            event: inRegisterEvent,
            uuid: inUUID
        };

        websocket.send(JSON.stringify(register));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        switch (jsonObj.event) {
            case 'didReceiveSettings':
                refreshSettings(jsonObj.payload.settings);
                break;
            case 'propertyInspectorDidDisappear':
                updateSettings();
                break;
            default:
                break;
        }
    };
}

function refreshSettings(settings) {
    var select_single = document.getElementById('select_single');
    var text_host = document.getElementById('text_host');
    var text_username = document.getElementById('text_username');
    var text_password = document.getElementById('text_password');
    var text_port = document.getElementById('text_port');
    var text_id = document.getElementById('text_id');
    var text_topic_on = document.getElementById('text_topic_on');
    var text_topic_off = document.getElementById('text_topic_off');
    var text_payload_on = document.getElementById('text_payload_on');
    var text_payload_off = document.getElementById('text_payload_off');
    var text_error_topic = document.getElementById('text_error_topic');
    

    if (settings) {
        select_single.value = settings.selectedValue;
        text_host.value = settings.hostname;
        text_username.value = settings.username;
        text_password.value = settings.password;
        text_port.value = settings.port;
        text_id.value = settings.mqtt_id;
        text_topic_on.value = settings.topic_on;
        text_topic_off.value = settings.topic_off;
        text_payload_off.value = settings.payload_off;
        text_payload_on.value = settings.payload_on;
        text_error_topic.value = settings.error_topic;


    }

    select_single.disabled = false;
    text_host.disabled = false;
    text_username.disabled = false;
    text_password.disabled = false;
    text_port.disabled = false;
    text_id.disabled = false;
    text_topic_on.disabled = false;
    text_topic_off.disabled = false;
    text_payload_off.disabled = false;
    text_payload_on.disabled = false;
    text_error_topic.disabled = false;

}

function updateSettings() {
    var select_single = document.getElementById('select_single');
    var text_host = document.getElementById('text_host');
    var text_username = document.getElementById('text_username');
    var text_password = document.getElementById('text_password');
    var text_port = document.getElementById('text_port');
    var text_id = document.getElementById('text_id');
    var text_topic_on = document.getElementById('text_topic_on');
    var text_topic_off = document.getElementById('text_topic_off');
    var text_payload_on = document.getElementById('text_payload_on');
    var text_payload_off = document.getElementById('text_payload_off');
    var text_error_topic = document.getElementById('text_error_topic');

    var setSettings = {};
    setSettings.event = 'setSettings';
    setSettings.context = uuid;
    setSettings.payload = {};
    setSettings.payload.selectedValue = select_single.value;
    setSettings.payload.hostname = text_host.value;
    setSettings.payload.username = text_username.value;
    setSettings.payload.password = text_password.value;
    setSettings.payload.port = text_port.value;
    setSettings.payload.mqtt_id = text_id.value;

    setSettings.payload.topic_on = text_topic_on.value;
    setSettings.payload.topic_off = text_topic_off.value;

    setSettings.payload.payload_on = text_payload_on.value;
    setSettings.payload.payload_off = text_payload_off.value;

    setSettings.payload.error_topic = text_error_topic.value;



    websocket.send(JSON.stringify(setSettings));
}

if (!isQT) {
    document.addEventListener('DOMContentLoaded', function () {
        initPropertyInspector();
    });
}

function addDynamicStyles(clrs) {
    const node = document.getElementById('#sdpi-dynamic-styles') || document.createElement('style');
    if (!clrs.mouseDownColor) clrs.mouseDownColor = fadeColor(clrs.highlightColor, -100);
    const clr = clrs.highlightColor.slice(0, 7);
    const clr1 = fadeColor(clr, 100);
    const clr2 = fadeColor(clr, 60);
    const metersActiveColor = fadeColor(clr, -60);

    node.setAttribute('id', 'sdpi-dynamic-styles');
    node.innerHTML = `

    input[type="radio"]:checked + label span,
    input[type="checkbox"]:checked + label span {
        background-color: ${clrs.highlightColor};
    }

    input[type="radio"]:active:checked + label span,
    input[type="radio"]:active + label span,
    input[type="checkbox"]:active:checked + label span,
    input[type="checkbox"]:active + label span {
      background-color: ${clrs.mouseDownColor};
    }

    input[type="radio"]:active + label span,
    input[type="checkbox"]:active + label span {
      background-color: ${clrs.buttonPressedBorderColor};
    }

    td.selected,
    td.selected:hover,
    li.selected:hover,
    li.selected {
      color: white;
      background-color: ${clrs.highlightColor};
    }

    .sdpi-file-label > label:active,
    .sdpi-file-label.file:active,
    label.sdpi-file-label:active,
    label.sdpi-file-info:active,
    input[type="file"]::-webkit-file-upload-button:active,
    button:active {
      background-color: ${clrs.buttonPressedBackgroundColor};
      color: ${clrs.buttonPressedTextColor};
      border-color: ${clrs.buttonPressedBorderColor};
    }

    ::-webkit-progress-value,
    meter::-webkit-meter-optimum-value {
        background: linear-gradient(${clr2}, ${clr1} 20%, ${clr} 45%, ${clr} 55%, ${clr2})
    }

    ::-webkit-progress-value:active,
    meter::-webkit-meter-optimum-value:active {
        background: linear-gradient(${clr}, ${clr2} 20%, ${metersActiveColor} 45%, ${metersActiveColor} 55%, ${clr})
    }
    `;
    document.body.appendChild(node);
};

/** UTILITIES */

/*
    Quick utility to lighten or darken a color (doesn't take color-drifting, etc. into account)
    Usage:
    fadeColor('#061261', 100); // will lighten the color
    fadeColor('#200867'), -100); // will darken the color
*/
function fadeColor(col, amt) {
    const min = Math.min, max = Math.max;
    const num = parseInt(col.replace(/#/g, ''), 16);
    const r = min(255, max((num >> 16) + amt, 0));
    const g = min(255, max((num & 0x0000FF) + amt, 0));
    const b = min(255, max(((num >> 8) & 0x00FF) + amt, 0));
    return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, 0);
}
