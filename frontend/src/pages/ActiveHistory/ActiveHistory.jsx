
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Lightbulb,
  Fan,
  Blinds,
  Camera,
  AirVent,
} from "lucide-react";
import "./ActiveHistory.css";

const deviceTypes = {
  fan: { label: "Quạt", location: "Ban công", Icon: Fan },
  light: { label: "Đèn 1", location: "Phòng khách", Icon: Lightbulb },
  air: { label: "Điều hòa", location: "Phòng khách", Icon: AirVent },
  curtain: { label: "Rèm cửa", location: "Phòng ngủ", Icon: Blinds },
  camera: { label: "Camera cổng", location: "Sân trước", Icon: Camera },
};

const sampleEvents = [
  ["fan", "Tắt", "success", "09:35", "user"],
  ["fan", "Tắt", "success", "09:12", "sensor"],
  ["light", "Tắt", "success", "08:49", "sensor"],
  ["air", "Điều chỉnh", "success", "08:26", "sensor"],
  ["light", "Điều chỉnh", "success", "08:03", "user"],
  ["light", "Điều chỉnh", "success", "07:40", "user"],
  ["curtain", "Tắt", "success", "07:17", "user"],
  ["curtain", "Bật", "success", "06:54", "sensor"],
  ["curtain", "Bật", "failed", "06:31", "user"],
  ["camera", "Tắt", "success", "06:08", "schedule"],
  ["air", "Bật", "success", "05:45", "user"],
  ["light", "Bật", "success", "05:22", "sensor"],
  ["fan", "Bật", "failed", "05:00", "user"],
  ["camera", "Bật", "success", "04:37", "schedule"],
  ["curtain", "Tắt", "success", "04:14", "user"],
  ["air", "Tắt", "success", "03:51", "sensor"],
];

const sampleData = Array.from({ length: 40 }, (_, index) => {
  const event = sampleEvents[index % sampleEvents.length];
  const day = index < 10 ? "15" : "14";

  return {
    id: `EV-${2087 - index}`,
    device: event[0],
    action: event[1],
    status: event[2],
    time: event[3],
    source: event[4],
    date: `2026-08-${day}`,
  };
});

const actionLabels = {
  all: "Tất cả",
  Bật: "Bật",
  Tắt: "Tắt",
  "Điều chỉnh": "Điều chỉnh",
};

const statusLabels = {
  all: "Tất cả",
  success: "Thành công",
  failed: "Thất bại",
};

const sourceLabels = {
  user: "Người dùng",
  sensor: "Cảm biến kích hoạt",
  schedule: "Tự động (hẹn giờ)",
};

function ActiveHistory() {
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("2026-08-14");
  const [endDate, setEndDate] = useState("2026-08-15");
  const [search, setSearch] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    device: "all",
    action: "all",
    status: "all",
    start: "2026-08-14",
    end: "2026-08-15",
    search: "",
  });

  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const filteredData = useMemo(() => {
    const result = sampleData.filter((item) => {
      const matchesDevice =
        appliedFilters.device === "all" ||
        item.device === appliedFilters.device;

      const matchesAction =
        appliedFilters.action === "all" ||
        item.action === appliedFilters.action;

      const matchesStatus =
        appliedFilters.status === "all" ||
        item.status === appliedFilters.status;

      const matchesStart =
        !appliedFilters.start ||
        item.date >= appliedFilters.start;

      const matchesEnd =
        !appliedFilters.end ||
        item.date <= appliedFilters.end;

      const keyword = appliedFilters.search.toLowerCase();

      const device = deviceTypes[item.device];

      const searchableText = [
        item.id,
        device.label,
        device.location,
        item.action,
        statusLabels[item.status],
        sourceLabels[item.source],
        item.time,
        item.date,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesDevice &&
        matchesAction &&
        matchesStatus &&
        matchesStart &&
        matchesEnd &&
        searchableText.includes(keyword)
      );
    });

    result.sort((a, b) => {
      const dateTimeA = new Date(
        `${a.date}T${a.time}:00`
      ).getTime();

      const dateTimeB = new Date(
        `${b.date}T${b.time}:00`
      ).getTime();

      return sortOrder === "desc"
        ? dateTimeB - dateTimeA
        : dateTimeA - dateTimeB;
    });

    return result;
  }, [appliedFilters, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageData = filteredData.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const applyFilters = () => {
    setAppliedFilters({
      device: deviceFilter,
      action: actionFilter,
      status: statusFilter,
      start: startDate,
      end: endDate,
      search: search.trim(),
    });

    setCurrentPage(1);
  };

  const resetFilters = () => {
    setDeviceFilter("all");
    setActionFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setSearch("");

    setAppliedFilters({
      device: "all",
      action: "all",
      status: "all",
      start: "",
      end: "",
      search: "",
    });

    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) =>
      prev === "desc" ? "asc" : "desc"
    );
    setCurrentPage(1);
  };

  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const [now] = useState(() => new Date());

  return (
    <main className="history-page">
      {/* <header className="history-header">
        <div>
          <h1>Lịch sử hoạt động</h1>
          <span>ACTIVE HISTORY</span>
        </div>

        <div className="history-clock">
          <span>
            {now.toLocaleTimeString("vi-VN", {
              hour12: false,
            })}
          </span>
          <small>
            {now.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </small>
        </div>
      </header> */}

      <section className="history-filter-panel">
        <div className="history-filter-group">
          <label htmlFor="history-device">THIẾT BỊ</label>
          <select
            id="history-device"
            value={deviceFilter}
            onChange={(event) =>
              setDeviceFilter(event.target.value)
            }
          >
            <option value="all">Tất cả </option>
            {Object.entries(deviceTypes).map(([key, device]) => (
              <option key={key} value={key}>
                {device.label}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-group">
          <label htmlFor="history-action">HÀNH ĐỘNG</label>
          <select
            id="history-action"
            value={actionFilter}
            onChange={(event) =>
              setActionFilter(event.target.value)
            }
          >
            {Object.entries(actionLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-group">
          <label htmlFor="history-status">TRẠNG THÁI</label>
          <select
            id="history-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="history-filter-group history-date-group">
          <label>TỪ NGÀY – ĐẾN NGÀY (LỌC THỦ CÔNG)</label>
          <div className="history-date-range">
            <input
              aria-label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
            />
            <span>→</span>
            <input
              aria-label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
            />
          </div>
        </div>

        <div className="history-filter-group history-search-group">
          <label htmlFor="history-search">TÌM KIẾM TỪ KHÓA</label>
          <div className="history-search-box">
            <Search size={15} />
            <input
              id="history-search"
              type="text"
              placeholder="Tìm ID, tên thiết bị, hành động..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
            />
          </div>
        </div>

        <button
          className="history-filter-button"
          onClick={applyFilters}
        >
          <Filter size={14} />
          Lọc
        </button>

        <button
          className="history-reset-button"
          onClick={resetFilters}
        >
          <RotateCcw size={13} />
          Đặt lại
        </button>
      </section>

      <section className="history-table-panel">
        <div className="history-table-scroll">
          <table className="history-table">
            <thead>
              <tr>
                <th className="history-id-col">ID <span>⌄</span></th>
                <th className="history-device-col">TÊN THIẾT BỊ</th>
                <th className="history-action-col">HÀNH ĐỘNG</th>
                <th className="history-status-col">TRẠNG THÁI</th>
                <th className="history-time-col">
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
                    <span>
                      {sortOrder === "desc" ? "↓" : "↑"}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {pageData.map((item) => {
                const device = deviceTypes[item.device];
                const Icon = device.Icon;

                return (
                  <tr key={item.id}>
                    <td className="history-id-cell">
                      {item.id}
                    </td>

                    <td>
                      <div className="history-device-cell">
                        <div className="history-device-icon">
                          <Icon size={13} />
                        </div>

                        <div>
                          <strong>{device.label}</strong>
                          <small>{device.location}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`history-action-badge ${
                          item.action === "Bật"
                            ? "action-on"
                            : item.action === "Điều chỉnh"
                            ? "action-adjust"
                            : "action-off"
                        }`}
                      >
                        <i />
                        {item.action}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`history-status-badge ${
                          item.status === "success"
                            ? "status-success"
                            : "status-failed"
                        }`}
                      >
                        <i />
                        {statusLabels[item.status]}
                      </span>
                    </td>

                    <td className="history-time-cell">
                      <span>
                        {item.time} ·{" "}
                        {item.date.split("-").reverse().join("/")}
                      </span>
                      <small>
                        {item.date.endsWith("15")
                          ? "12 giờ trước"
                          : "1 ngày trước"}{" "}
                        · {sourceLabels[item.source]}
                      </small>
                    </td>
                  </tr>
                );
              })}

              {pageData.length === 0 && (
                <tr>
                  <td colSpan="5" className="history-empty">
                    Không tìm thấy lịch sử hoạt động phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="history-table-footer">
          <span>
            Hiển thị{" "}
            {filteredData.length === 0
              ? 0
              : (safePage - 1) * pageSize + 1}
            –
            {Math.min(
              safePage * pageSize,
              filteredData.length
            )}{" "}
            / {filteredData.length}
          </span>

          <div className="history-pagination">
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                className={safePage === page ? "active" : ""}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </footer>
      </section>
    </main>
  );
}

export default ActiveHistory;