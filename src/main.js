import axios from 'axios';
import Leap from 'leapjs';

const LEAPD_HOST = process.env['LEAPD_HOST'];
const BRIDGE_IP = process.env['BRIDGE_IP'];
const BRIDGE_USERNAME = process.env['BRIDGE_USERNAME'];
const LIGHT_IDS = process.env['LIGHT_IDS'].split(',');

const GESTURE_MAPPING = {
  brightness: { minHeight: 150, maxHeight: 280 },
  colorTemp: { minX: 150, maxX: 280 },
  toggle: { onThreshold: -0.7, offThreshold: 0.7 },
  adjust: { pinchThreshold: 0.85 },
};

const THROTTLE_DELAY_MS = 100;

let lastUpdateTime = 0;
let currentLightState = { on: null, bri: null, ct: null };

const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const clamped = Math.max(inMin, Math.min(value, inMax));
  const normalized = (clamped - inMin) / (inMax - inMin);
  return Math.round(outMin + normalized * (outMax - outMin));
};

const updateHueLights = async (payload) => {
  if (Object.keys(payload).length === 0) return;
  for (const id of LIGHT_IDS) {
    const url = `http://${BRIDGE_IP}/api/${BRIDGE_USERNAME}/lights/${id}/state`;
    try {
      await axios.put(url, payload);
    } catch (e) {
      console.error(e);
    }
  }
};

const controller = new Leap.Controller({ host: LEAPD_HOST });

let firstFrameReceived = false;

controller.on('frame', (frame) => {
  if (!firstFrameReceived) {
    firstFrameReceived = true;
    console.log('First frame received');
  }

  if (frame.hands.length === 0) return;

  const now = Date.now();
  if (now - lastUpdateTime < THROTTLE_DELAY_MS) return;
  lastUpdateTime = now;

  const payload = {};

  frame.hands.forEach((hand) => {
    const palmNormalY = hand.palmNormal[1];
    let desiredOn = currentLightState.on;

    if (palmNormalY > GESTURE_MAPPING.toggle.offThreshold) {
      desiredOn = false;
    } else if (palmNormalY < GESTURE_MAPPING.toggle.onThreshold) {
      desiredOn = true;
    }

    payload.on = desiredOn;
    currentLightState.on = desiredOn;

    if (!currentLightState.on) return;

    const extendedCount = hand.fingers.filter((f) => f.extended).length;
    console.log(extendedCount)

    if (extendedCount === 2) {
      const palmHeight = hand.stabilizedPalmPosition[1];
      const desiredBri = mapRange(
        palmHeight,
        GESTURE_MAPPING.brightness.minHeight,
        GESTURE_MAPPING.brightness.maxHeight,
        1,
        254
      );
      if (desiredBri !== currentLightState.bri) {
        payload.bri = desiredBri;
        currentLightState.bri = desiredBri;
      }
    }

    if (extendedCount === 3) {
      const palmHeight = hand.stabilizedPalmPosition[1];
      const desiredCt = mapRange(
        palmHeight,
        GESTURE_MAPPING.colorTemp.minX,
        GESTURE_MAPPING.colorTemp.maxX,
        454,
        153
      );
      if (desiredCt !== currentLightState.ct) {
        payload.ct = desiredCt;
        currentLightState.ct = desiredCt;
      }
    }
  });

  updateHueLights(payload);
});

controller.connect();