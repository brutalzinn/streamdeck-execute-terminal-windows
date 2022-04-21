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
function hexToHSL(H) {
    //20042022.15.08
    //https://css-tricks.com/converting-color-spaces-in-javascript/
    let r = 0, g = 0, b = 0;

    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    red = parseInt(r)
    green = parseInt(g)
    blue = parseInt(b)
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return {
        red,
        green,
        blue,
        hue: h,
        saturation: s,
        lum: l
    }
}

function RGBToHex(r, g, b) {
    //20042022.15.08
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

function loadColorPicker(data) {
    if(data != null)
    return RGBToHex(data.red, data.green, data.blue)
}

function refreshSettings(settings) {
    var select_single = document.getElementById('select_single');
    var select_color = document.getElementById('select_color');
    var text_demo = document.getElementById('text_demo');

    if (settings) {
        select_single.value = settings.selectedValue;
        select_color.value = loadColorPicker(settings.selectedColor);
        text_demo.value = settings.textDemoValue;
    }

    select_single.disabled = false;
    select_color.disabled = false;
    text_demo.disabled = false;
}

function updateSettings() {
    var select_single = document.getElementById('select_single');
    var text_demo = document.getElementById('text_demo');
    var select_color = document.getElementById('select_color');

    var setSettings = {};
    setSettings.event = 'setSettings';
    setSettings.context = uuid;
    setSettings.payload = {};
    setSettings.payload.selectedValue = select_single.value;
    setSettings.payload.selectedColor = hexToHSL(select_color.value);
    setSettings.payload.textDemoValue = text_demo.value;

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
