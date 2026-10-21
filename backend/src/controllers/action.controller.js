import { listActions } from "../services/action.service.js";

const ACTIONS = ["all", "Bật", "Tắt"];
const STATUSES = ["all", "SUCCESS", "FAILED", "PENDING"];

export async function list(req, res) {
  const device = String(req.query.device ?? "all").slice(0, 50) || "all";
  const action = ACTIONS.includes(req.query.action) ? req.query.action : "all";
  const status = STATUSES.includes(req.query.status) ? req.query.status : "all";
  const search = String(req.query.search ?? "").slice(0, 100);
  const sort = req.query.sort === "asc" ? "asc" : "desc";
  const pageSize = Math.min(Math.max(Math.floor(Number(req.query.pageSize)) || 10, 1), 100);
  const page = Math.max(Math.floor(Number(req.query.page)) || 1, 1);

  const { rows, total } = await listActions({
    device, action, status, search, sort, page, pageSize,
  });

  res.json({
    data: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}