import { useEffect, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { fetchActions } from "../../services/actionService";
import { fetchDevices } from "../../services/deviceService";
import "./ActiveHistory.css";

const DEFAULT_PAGE_SIZE = 10;
const PAGINATION_DELTA = 1;

const actionLabels = {
  all: "Tất cả",
  Bật: "Bật",
  Tắt: "Tắt",
};

const statusLabels = {
  all: "Tất cả",
  SUCCESS: "Success",
  FAILED: "Failed",
};


const formatDate = (date) => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

const formatDateTime = (item) => {
  return `${item.time} · ${formatDate(item.date)}`;
};

const getPaginationRange = (currentPage, totalPages) => {
  const range = [];

  for (let i = 1; i <= totalPages; i++) {
    const isFirst = i === 1;
    const isLast = i === totalPages;
    const isNearCurrent = i >= currentPage - PAGINATION_DELTA && i <= currentPage + PAGINATION_DELTA;

    if (isFirst || isLast || isNearCurrent) {
      range.push(i);
    }
  }

  const rangeWithDots = [];
  let previous;

  for (const page of range) {
    if (previous) {
      if (page - previous === 2) {
        rangeWithDots.push(previous + 1);
      } else if (page - previous !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(page);
    previous = page;
  }

  return rangeWithDots;
};

function ActiveHistory() {
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeSearch, setTimeSearch] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    device: "all",
    action: "all",
    status: "all",
    timeSearch: "",
  });

  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [devices, setDevices] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDevices()
      .then(setDevices)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetchActions({
          device: appliedFilters.device,
          action: appliedFilters.action,
          status: appliedFilters.status,
          search: appliedFilters.timeSearch,
          sort: sortOrder,
          page: currentPage,
          pageSize,
        });
        if (ignore) return;
        setRows(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setError("");
      } catch {
        if (!ignore) setError("Không kết nối được server");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [appliedFilters, sortOrder, currentPage, pageSize]);

  const safePage = Math.min(currentPage, totalPages);

  const applyFilters = () => {
    setAppliedFilters({
      device: deviceFilter,
      action: actionFilter,
      status: statusFilter,
      timeSearch: timeSearch.trim(),
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setDeviceFilter("all");
    setActionFilter("all");
    setStatusFilter("all");
    setTimeSearch("");
    setAppliedFilters({
      device: "all",
      action: "all",
      status: "all",
      timeSearch: "",
    });
    setCurrentPage(1);
  };

  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  return (
    <main className="history-page">
      <section className="history-filter-panel">
        <div className="history-filter-group history-device-group">
          <label htmlFor="history-device">THIẾT BỊ</label>
          <select
            id="history-device"
            value={deviceFilter}
            onChange={(event) => setDeviceFilter(event.target.value)}
          >
            <option value="all">Tất cả</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-group history-action-group">
          <label htmlFor="history-action">HÀNH ĐỘNG</label>
          <select
            id="history-action"
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
          >
            {Object.entries(actionLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-group history-status-group">
          <label htmlFor="history-status">TRẠNG THÁI</label>
          <select
            id="history-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-group history-search-group">
          <label htmlFor="history-search">TÌM KIẾM</label>
          <div className="history-search-box">
            <Search size={18} />
            <input
              id="history-search"
              type="text"
              placeholder="VD: 09:20:15, 15/08/2026..."
              value={timeSearch}
              onChange={(event) => setTimeSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
        </div>

        <button type="button" className="history-filter-button" onClick={applyFilters}>
          Tìm kiếm
        </button>

        <button type="button" className="history-reset-button" onClick={resetFilters}>
          <RotateCcw size={15} />
          Đặt lại
        </button>
      </section>

      <section className="history-table-panel">
        <div className="history-table-scroll">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TÊN THIẾT BỊ</th>
                <th>NGƯỜI THỰC HIỆN</th>
                <th>HÀNH ĐỘNG</th>
                <th>TRẠNG THÁI</th>
                <th>
                  <button
                    type="button"
                    className="history-sort-button"
                    onClick={toggleSortOrder}
                    title={
                      sortOrder === "desc"
                        ? "Đang sắp xếp mới đến cũ"
                        : "Đang sắp xếp cũ đến mới"
                    }
                  >
                    THỜI GIAN
                    <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td className="history-id-cell">{item.id}</td>
                  <td className="history-device-cell">
                    <strong>{item.deviceName}</strong>
                    <small>{item.location}</small>
                  </td>
                  <td className="history-actor-cell">{item.actor}</td>
                  <td className={`history-simple-cell ${item.action === "Bật" ? "status-on" : "status-off"}`}>
                    {item.action}
                  </td>
                  <td className={`history-simple-cell ${item.status === "SUCCESS" ? "status-on" : "status-off"}`}>
                    {statusLabels[item.status] ?? item.status}
                  </td>
                  <td className="history-time-cell">{formatDateTime(item)}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="6" className="history-empty">
                    {error || (loading ? "Đang tải..." : "Không tìm thấy lịch sử hoạt động phù hợp.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="history-table-footer">
          <div className="history-footer-left">
            <span className="history-result-count">
              Hiển thị{" "}
              {total === 0 ? 0 : (safePage - 1) * pageSize + 1}
              –
              {Math.min(safePage * pageSize, total)} /{" "}
              {total}
            </span>

            <div className="history-page-size">
              <label htmlFor="history-page-size">Size page</label>
              <select
                id="history-page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="history-pagination">
            <button
              type="button"
              className="history-pagination-arrow"
              disabled={safePage === 1}
              onClick={() => changePage(safePage - 1)}
            >
              ‹
            </button>

            {getPaginationRange(safePage, totalPages).map((item, index) => {
              if (item === "...") {
                return (
                  <span key={`dots-${index}`} className="history-pagination-dots">
                    ...
                  </span>
                );
              }

              return (
                <button
                  type="button"
                  key={item}
                  className={safePage === item ? "active" : ""}
                  onClick={() => changePage(item)}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              className="history-pagination-arrow"
              disabled={safePage === totalPages}
              onClick={() => changePage(safePage + 1)}
            >
              ›
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActiveHistory;