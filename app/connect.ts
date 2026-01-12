import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Buffer } from "buffer";
import { saveTestRecord, SoilTestRecord, SoilData } from "../database/datastorage";

const manager = new BleManager();

const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const TRANSFER_UUID = "abcdef12-3456-7890-1234-567890abcdef";

let activeDevice: Device | null = null;
let notifySub: Subscription | null = null;
let incomingBuffer = "";

type LogListener = (message: string) => void;
let onLog: LogListener | null = null;

export const setLogListener = (callback: LogListener | null) => {
  onLog = callback;
};

const updateStatus = (msg: string) => {
  console.log(msg);
  if (onLog) onLog(msg);
};


export const scanForAgni = (): Promise<Device> =>
    new Promise((resolve, reject) => {
        updateStatus("🔍 START SCAN (Agni only)");

        manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.log("❌ SCAN ERROR", error);
                reject(error);
                return;
            }

            if (device?.name === "AGNI-SOIL-SENSOR") {
                updateStatus(`📡 FOUND DEVICE: ${device.name} (${device.id})`);
                manager.stopDeviceScan();
                resolve(device);
            }
        });
    });


export const connectDevice = async (device: Device) => {
    updateStatus("🔌 CONNECTING…");
    let d = await device.connect({ autoConnect: false });

    updateStatus("🔍 DISCOVERING SERVICES…");
    d = await d.discoverAllServicesAndCharacteristics();

    try {
        await d.requestMTU(247);
        updateStatus("📏 MTU OK");
    } catch (e) {
        console.log("⚠️ MTU FAILED:", e);
    }

    activeDevice = d;

    d.onDisconnected((e) => {
        console.log(
            "🔌 DISCONNECTED:",
            e ? e.message : "sensor closed the link"
        );
    });

    return d;
};

const saveIncomingJson = async (json: string) => {
  const parsed = JSON.parse(json);
  console.log("📦 COMPLETE JSON:", parsed);

  const toNumber = (v: any) =>
    v === undefined || v === null || v === "" ? 0 : Number(v);

  const mapped: SoilData = {
    pH: toNumber(parsed.pH ?? parsed.ph),
    nitrogen: toNumber(parsed.nitrogen ?? parsed.N),
    phosphorus: toNumber(parsed.phosphorus ?? parsed.P),
    potassium: toNumber(parsed.potassium ?? parsed.K),
    moisture: toNumber(parsed.moisture),
    temperature: toNumber(parsed.temperature ?? parsed.temp),
    ec: toNumber(parsed.ec ?? parsed.EC),
  };

  if (!Object.values(mapped).some(v => v > 0)) {
    console.log("⚠️ JSON had no numeric soil values — skipped");
    return;
  }

  const newRecord: Omit<SoilTestRecord, "id" | "date" | "time"> = {
    soilData: mapped,
    chatHistory: [],
    pHStatus: "Neutral",
    pHColor: "",
    latitude: 0,
    longitude: 0,
    location: "Agni Device",
  };

  const saved = await saveTestRecord(newRecord, "Agni Device");
  if (saved) console.log(`💾 Saved device record (ID: ${saved.id})`);
  else console.log("❌ Failed to save parsed device data");
};


let isClosing = false;

export const subscribeToSoilData = async () => {
  if (!activeDevice) throw new Error("Device not connected");
  
  incomingBuffer = "";
  isClosing = false;

  notifySub = activeDevice.monitorCharacteristicForService(
    SERVICE_UUID,
    TRANSFER_UUID,
    async (err, char) => {
      if (isClosing) return;

      if (err) {
        console.log("ℹ️ BLE Stream ended naturally.");
        return;
      }

      if (!char?.value) return;
      const chunk = Buffer.from(char.value, "base64").toString("utf8");
      updateStatus("📥 Receiving a new file...");
      incomingBuffer += chunk;

      if (incomingBuffer.includes("FILE_END")) {
        const startIdx = incomingBuffer.indexOf("{");
        const endIdx = incomingBuffer.lastIndexOf("}");
        if (startIdx !== -1 && endIdx !== -1) {
          const finalJson = incomingBuffer.substring(startIdx, endIdx + 1);
          // await saveIncomingJson(finalJson);
          incomingBuffer = incomingBuffer.substring(incomingBuffer.indexOf("FILE_END") + 8);
        }
      }

      if (incomingBuffer.includes("ALL FILES TRANSFERED") || incomingBuffer.includes("TRANSFER_COMPLETE")) {
        updateStatus("🏁 FINISHED. CLEANING UP...");
        
        isClosing = true;
        setTimeout(() => {
          disconnectDevice();
        }, 1000);
      }
    }
  );
};

export const disconnectDevice = async () => {
  try {
    if (activeDevice) {
      const connected = await activeDevice.isConnected();
      if (connected) {
        await activeDevice.cancelConnection();
      }
    }
  } catch (e) {
    console.log("⚠️ Handled disconnect error (Safe):", e);
  } finally {
    activeDevice = null;
    isClosing = false;
    console.log("🔌 Disconnected.");
  }
};

export const startAgniSession = async () => {
  const device = await scanForAgni();
  await connectDevice(device);
  await subscribeToSoilData();
};

export const stopAgniSession = async () => {
  await disconnectDevice();
};
