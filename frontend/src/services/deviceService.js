import api from "./api";

export async function fetchDevices() {
  const { data } = await api.get("/devices");
  return data.data; // [{ id, name, location, type, status }]
}

export async function toggleDeviceApi(id, on) {
  const { data } = await api.post(`/devices/${id}/toggle`, { on });
  return data;
}