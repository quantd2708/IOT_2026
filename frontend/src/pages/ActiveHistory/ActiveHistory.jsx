import { useMemo, useState } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import "./ActiveHistory.css";

const DEFAULT_PAGE_SIZE = 10;
const PAGINATION_DELTA = 1;

const deviceTypes = {
  light1: { label: "Đèn 1", location: "Phòng khách" },
  light2: { label: "Đèn 2", location: "Phòng ngủ" },
  light3: { label: "Đèn 3", location: "Ban công" },
};

const actionLabels = {
  all: "Tất cả",
  Bật: "Bật",
  Tắt: "Tắt",
};

const statusLabels = {
  all: "Tất cả",
  Bật: "Bật",
  Tắt: "Tắt",
};

const actorList = [
  "Trần Đức Quân",
];

const sampleData = Array.from({ length: 150 }, (_, index) => {
  const devices = ["light1", "light2", "light3"];
  const actions = ["Bật", "Tắt"];

  const device = devices[Math.floor(Math.random() * devices.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const status = action;
  const actor = actorList[Math.floor(Math.random() * actorList.length)];

  const d = new Date("2026-08-15T22:00:00");
  d.setMinutes(d.getMinutes() - index * 17);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String((index * 13) % 60).padStart(2, "0");

  return {
    id: `AC-${397 - index}`,
    device,
    action,
    status,
    actor,
    time: `${hours}:${minutes}:${seconds}`,
    date: `${year}-${month}-${day}`,
  };
});

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

  const filteredData = useMemo(() => {
    const keyword = appliedFilters.timeSearch.trim().toLowerCase();

    const result = sampleData.filter((item) => {
      const matchesDevice = appliedFilters.device === "all" || item.device === appliedFilters.device;
      const matchesAction = appliedFilters.action === "all" || item.action === appliedFilters.action;
      const matchesStatus = appliedFilters.status === "all" || item.status === appliedFilters.status;

      const displayDate = formatDate(item.date);
      const dateTime = formatDateTime(item);
      const searchableTime = [item.time, item.date, displayDate, dateTime].join(" ").toLowerCase();

      const matchesTime = !keyword || searchableTime.includes(keyword);

      return matchesDevice && matchesAction && matchesStatus && matchesTime;
    });

    result.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();

      return sortOrder === "desc" ? dateTimeB - dateTimeA : dateTimeA - dateTimeB;
    });

    return result;
  }, [appliedFilters, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

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
            {Object.entries(deviceTypes).map(([key, device]) => (
              <option key={key} value={key}>
                {device.label} 
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
              {pageData.map((item) => {
                const device = deviceTypes[item.device];

                return (
                  <tr key={item.id}>
                    <td className="history-id-cell">{item.id}</td>
                    <td className="history-device-cell">
                      <strong>{device.label}</strong>
                      <small>{device.location}</small>
                    </td>
                    <td className="history-actor-cell">{item.actor}</td>
                    <td className={`history-simple-cell ${item.action === 'Bật' ? 'status-on' : item.action === 'Tắt' ? 'status-off' : ''}`}>
                      {actionLabels[item.action]}
                    </td>
                    <td className={`history-simple-cell ${item.status === 'Bật' ? 'status-on' : item.status === 'Tắt' ? 'status-off' : ''}`}>
                      {statusLabels[item.status]}
                    </td>
                    <td className="history-time-cell">{formatDateTime(item)}</td>
                  </tr>
                );
              })}

              {pageData.length === 0 && (
                <tr>
                  <td colSpan="6" className="history-empty">
                    Không tìm thấy lịch sử hoạt động phù hợp.
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
              {filteredData.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
              –
              {Math.min(safePage * pageSize, filteredData.length)} /{" "}
              {filteredData.length}
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