import api from "./api";

export async function fetchDevices() {
  const { data } = await api.get("/devices");
  return data.data; 
}

export async function toggleDeviceApi(id, on) {
  const { data } = await api.post(`/devices/${id}/toggle`, { on });
  return data;
}