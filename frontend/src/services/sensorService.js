import api from "./api";

export async function fetchLatestSensors(limit = 20) {
  const { data } = await api.get("/sensors/latest", { params: { limit } });
  return data.data;
}

export async function fetchSensorReadings(params) {
  const { data } = await api.get("/sensors", { params });
  return data; // { data, total, page, pageSize, totalPages }
}