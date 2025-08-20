import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Input,
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

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch tickets
  const fetchTickets = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...params,
      };

      if (searchText) {
        queryParams.search = searchText;
      }

      const res = await ApiService.getAllTickets(queryParams);
      if (res.success) {
        setTickets(res.data);
        setPagination((prev) => ({
          ...prev,
          total: res.total,
        }));
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

  useEffect(() => {
    fetchTickets();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.current === 1) {
        fetchTickets();
      } else {
        setPagination((prev) => ({ ...prev, current: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleRefresh = () => {
    fetchTickets();
    message.success("Đã làm mới danh sách vé");
  };

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
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.user?.name || "Ẩn danh"}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.user?.email}
          </div>
        </div>
      ),
    },
    {
        title: "Phim",
        key: "movie",
        render: (_, record) => (
            <div style={{ fontWeight: 500 }}>
            <VideoCameraOutlined style={{ marginRight: 4 }} />
            {record.movie?.title || record.movieName || "N/A"}
            </div>
        ),
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
      render: (_, record) =>
        record.showDate
          ? moment(record.showDate).format("DD/MM/YYYY")
          : record.showtime?.showDate
          ? moment(record.showtime.showDate).format("DD/MM/YYYY")
          : "N/A",
    },
    {
      title: "Giờ chiếu",
      key: "showTime",
      render: (_, record) =>
        record.showTime || record.showtime?.showTime || "N/A",
    },
    {
      title: "Ghế",
      key: "seats",
      render: (_, record) => {
        if (record.seats && Array.isArray(record.seats)) {
          return record.seats
            .map((s) =>
              typeof s === "string"
                ? s
                : s?.seatNumber || s?.name || s?._id?.slice(-3) || "N/A"
            )
            .join(", ");
        }
        if (record.seatNumbers) return record.seatNumbers;
        if (record.seatNumber) return record.seatNumber;
        return "N/A";
      },
    },
    {
        title: "Tổng tiền",
        key: "totalPrice",
        render: (_, record) => (
            <div style={{ fontWeight: 600, color: "#52c41a" }}>
            {(record.totalPrice || record.price || record.amount || 0).toLocaleString()}đ
            </div>
        ),
        },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <Tag
          color={
            record.status === "confirmed" || record.status === "active"
              ? "green"
              : record.status === "cancelled" || record.status === "canceled"
              ? "red"
              : record.status === "pending"
              ? "orange"
              : "default"
          }
        >
          {record.status === "confirmed" || record.status === "active"
            ? "Đã xác nhận"
            : record.status === "cancelled" || record.status === "canceled"
            ? "Đã hủy"
            : record.status === "pending"
            ? "Chờ xác nhận"
            : record.status}
        </Tag>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? moment(date).format("DD/MM/YY HH:mm") : "Không rõ",
    },
  ];

  const handleTableChange = (paginationInfo) => {
    setPagination({
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
      total: pagination.total,
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
        <Row justify="space-between" align="middle">
          <Col>
            <Input.Search
              placeholder="Tìm kiếm theo khách hàng, phim, rạp..."
              allowClear
              style={{ width: 400 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={tickets}
            rowKey="_id"
            pagination={{
              ...pagination,
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
