import api from "./api";

export async function fetchActions(params) {
  const { data } = await api.get("/actions", { params });
  return data; // { data, total, page, pageSize, totalPages }
}