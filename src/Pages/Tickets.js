import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Select,
  message,
  Spin,
} from "antd";
import {
  ReloadOutlined,
  VideoCameraOutlined,
  BankOutlined,
} from "@ant-design/icons";
import moment from "moment";
import ApiService from "../config/api"; 

const { Title } = Typography;
const { Option } = Select;

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAllTickets({
        page: 1,
        limit: 1000, // lấy đủ dữ liệu để lọc frontend
      });

      if (res.success) {
        setTickets(res.data);
        setPagination((prev) => ({
          ...prev,
          total: res.total,
        }));

        // Lấy danh sách movie & cinema từ tickets
        const moviesSet = new Set();
        const cinemasSet = new Set();
        res.data.forEach((t) => {
          if (t.movie?._id) moviesSet.add(JSON.stringify({ _id: t.movie._id, name: t.movie.name || t.movie.title }));
          if (t.cinema?._id) cinemasSet.add(JSON.stringify({ _id: t.cinema._id, name: t.cinema.name }));
        });
        setMovies(Array.from(moviesSet).map((v) => JSON.parse(v)));
        setCinemas(Array.from(cinemasSet).map((v) => JSON.parse(v)));
      } else {
        message.error(res.error || "Không thể lấy danh sách vé");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      message.error("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRefresh = () => {
    setSelectedMovie(null);
    setSelectedCinema(null);
    fetchTickets();
    message.success("Đã làm mới danh sách vé");
  };

  // Lọc tickets phía frontend
  const filteredTickets = tickets.filter((t) => {
    const matchMovie = selectedMovie ? t.movie?._id === selectedMovie : true;
    const matchCinema = selectedCinema ? t.cinema?._id === selectedCinema : true;
    return matchMovie && matchCinema;
  });

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "name"],
      key: "customer",
      render: (_, record) => {
        const customerName =
          record.userInfo?.fullName ||
          record.customerName ||
          record.user?.name ||
          "Ẩn danh";
        const customerEmail =
          record.userInfo?.email ||
          record.customerEmail ||
          record.user?.email ||
          "";
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{customerName}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{customerEmail}</div>
          </div>
        );
      },
    },
    {
      title: "Phim",
      key: "movie",
      render: (_, record) => {
        const movieName =
          record.movie?.name ||
          record.movie?.title ||
          record.movieName ||
          record.movieTitle ||
          "N/A";
        return (
          <div style={{ fontWeight: 500 }}>
            <VideoCameraOutlined style={{ marginRight: 4 }} />
            {movieName}
          </div>
        );
      },
    },
    {
      title: "Rạp / Phòng",
      key: "cinema",
      render: (_, record) => (
        <div>
          <BankOutlined style={{ marginRight: 4 }} />
          {record.cinema?.name || "N/A"} -{" "}
          {record.room?.name || record.roomName || "N/A"}
        </div>
      ),
    },
    {
      title: "Ngày chiếu",
      key: "showDate",
      render: (_, record) => {
        const showDate =
          record.showDate ||
          record.time?.showDate ||
          record.time?.date ||
          record.showtime?.showDate ||
          record.showtime?.date ||
          record.createdAt;
        return showDate ? moment(showDate).format("DD/MM/YYYY") : "N/A";
      },
    },
    {
      title: "Giờ chiếu",
      key: "showTime",
      render: (_, record) => {
        const showTimeRaw =
          record.showTime ||
          record.time?.startTime ||
          record.time?.time ||
          record.showtime?.startTime ||
          record.showtime?.time ||
          record.startTime;
        if (!showTimeRaw) return "N/A";
        const showTimeMoment = moment(showTimeRaw);
        if (!showTimeMoment.isValid()) return showTimeRaw;
        return showTimeMoment.format("HH:mm");
      },
    },
    {
      title: "Ghế",
      key: "seats",
      render: (_, record) => {
        let seatNames = "";
        if (record.seats && Array.isArray(record.seats)) {
          seatNames = record.seats
            .map((s) => {
              if (typeof s === "string") return s;
              return s?.seatNumber || s?.name || s?.row + s?.column || s?._id?.slice(-3) || "N/A";
            })
            .join(", ");
        } else if (record.seatNumbers) seatNames = record.seatNumbers;
        else if (record.seatNumber) seatNames = record.seatNumber;
        else if (record.selectedSeats && Array.isArray(record.selectedSeats)) {
          seatNames = record.selectedSeats
            .map((s) => s?.seatNumber || s?.name || "N/A")
            .join(", ");
        }
        return seatNames || "N/A";
      },
    },
    {
      title: "Tổng tiền",
      key: "totalPrice",
      render: (_, record) => {
        const price =
          record.total ||
          record.totalPrice ||
          record.totalAmount ||
          record.price ||
          record.amount ||
          record.seatTotalPrice ||
          0;
        return (
          <div style={{ fontWeight: 600, color: "#52c41a" }}>
            {price.toLocaleString()}đ
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const status = record.status;
        let color = "default";
        let text = status;
        switch (status) {
          case "completed":
          case "confirmed":
          case "active":
            color = "green";
            text = "Đã xác nhận";
            break;
          case "used":
          case "scanned":
          case "checked_in":
            color = "blue";
            text = "Đã sử dụng";
            break;
          case "cancelled":
          case "canceled":
            color = "red";
            text = "Đã hủy";
            break;
          case "pending":
          case "pending_payment":
            color = "orange";
            text = "Chờ thanh toán";
            break;
          default:
            color = "default";
            text = status || "Không rõ";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Ngày đặt",
      key: "createdAt",
      render: (_, record) => {
        const createdDate =
          record.createdAt || record.bookingTime || record.date || record.confirmedAt;
        return createdDate ? moment(createdDate).format("DD/MM/YY HH:mm") : "Không rõ";
      },
    },
  ];

  const handleTableChange = (paginationInfo) => {
    setPagination({
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
      total: filteredTickets.length,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>Danh sách vé</Title>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Làm mới
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select
              placeholder="Lọc theo phim"
              style={{ width: 200 }}
              value={selectedMovie}
              onChange={(val) => setSelectedMovie(val)}
            >
              <Option value={null}>Tất cả</Option>
              {movies.map((m) => (
                <Option key={m._id} value={m._id}>
                  {m.name || m.title}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Lọc theo rạp"
              style={{ width: 200 }}
              value={selectedCinema}
              onChange={(val) => setSelectedCinema(val)}
            >
              <Option value={null}>Tất cả</Option>
              {cinemas.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredTickets}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: filteredTickets.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} vé`,
            }}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Tickets;
