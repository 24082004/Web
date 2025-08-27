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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      render: (_, record) => {
        // Ưu tiên userInfo trước, sau đó mới đến user
        const customerName = record.userInfo?.fullName || 
                           record.customerName || 
                           record.user?.name || 
                           "Ẩn danh";
        const customerEmail = record.userInfo?.email || 
                            record.customerEmail || 
                            record.user?.email || 
                            "";
        
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {customerName}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {customerEmail}
            </div>
          </div>
        );
      },
    },
    {
      title: "Phim",
      key: "movie",
      render: (_, record) => {
        const movieName = record.movie?.name || 
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
        const showDate = record.showDate || 
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
        const showTime = record.showTime || 
                        record.time?.startTime || 
                        record.time?.time || 
                        record.showtime?.startTime || 
                        record.showtime?.time ||
                        record.startTime;
        
        return showTime || "N/A";
      },
    },
    {
      title: "Ghế",
      key: "seats",
      render: (_, record) => {
        let seatNames = "";
        
        // Thử nhiều cách để lấy thông tin ghế
        if (record.seats && Array.isArray(record.seats)) {
          seatNames = record.seats
            .map((s) => {
              if (typeof s === "string") return s;
              return s?.seatNumber || s?.name || s?.row + s?.column || s?._id?.slice(-3) || "N/A";
            })
            .join(", ");
        } else if (record.seatNumbers) {
          seatNames = record.seatNumbers;
        } else if (record.seatNumber) {
          seatNames = record.seatNumber;
        } else if (record.selectedSeats && Array.isArray(record.selectedSeats)) {
          seatNames = record.selectedSeats
            .map(s => s?.seatNumber || s?.name || "N/A")
            .join(", ");
        }
        
        return seatNames || "N/A";
      },
    },
    {
      title: "Tổng tiền",
      key: "totalPrice",
      render: (_, record) => {
        // Thử nhiều trường có thể chứa giá tiền từ backend
        const price = record.total || 
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
        const createdDate = record.createdAt || 
                           record.bookingTime || 
                           record.date ||
                           record.confirmedAt;
        
        return createdDate ? moment(createdDate).format("DD/MM/YY HH:mm") : "Không rõ";
      },
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
