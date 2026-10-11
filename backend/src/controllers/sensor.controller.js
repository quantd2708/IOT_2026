import { getLatestReadings, listReadings } from "../services/sensor.service.js";

const MODES = ["all", "temperature", "humidity", "light", "time"];

export async function latest(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 200);
  const data = await getLatestReadings(limit);

  res.json({
    data,
    latest: data[data.length - 1] ?? null,
  });
}

export async function list(req, res) {
  const mode = MODES.includes(req.query.mode) ? req.query.mode : "all";
  const search = String(req.query.search ?? "").slice(0, 100);
  const sort = req.query.sort === "asc" ? "asc" : "desc";
  const pageSize = Math.min(Math.max(Math.floor(Number(req.query.pageSize)) || 10, 1), 100);
  const page = Math.max(Math.floor(Number(req.query.page)) || 1, 1);

  const { rows, total } = await listReadings({ mode, search, sort, page, pageSize });

  res.json({
    data: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}