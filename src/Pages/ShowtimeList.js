import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  message,
  Switch,
} from "antd";
import moment from "moment";
import apiService from "../services/ApiService";

function ShowtimeList() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMovie, setSearchMovie] = useState("");
  const [searchCinema, setSearchCinema] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách suất chiếu
  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const res = await apiService.getShowtimes();
      console.log("Showtimes data:", res.data);
      setShowtimes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu phim, rạp, phòng
  useEffect(() => {
    fetchShowtimes();
    const fetchOptions = async () => {
      try {
        const movieRes = await apiService.getMovies();
        const cinemaRes = await apiService.getCinemas();
        const roomRes = await apiService.getRooms();
        setMovies(movieRes.data || []);
        setCinemas(cinemaRes.data || []);
        setRooms(roomRes.data || []);
      } catch (err) {
        console.error("Error fetch options:", err);
      }
    };
    fetchOptions();
  }, []);

  // Lọc dữ liệu theo input
  const filteredShowtimes = showtimes.filter((s) => {
    const movieName = s.movie?.name?.toLowerCase() || "";
    const cinemaName = s.cinema?.name?.toLowerCase() || "";
    return (
      movieName.includes(searchMovie.toLowerCase()) &&
      cinemaName.includes(searchCinema.toLowerCase())
    );
  });

  // Toggle trạng thái ẩn/hiện
  const handleToggleHidden = async (id, checked) => {
    try {
      const currentShowtime = showtimes.find(s => s._id === id);
      if (!currentShowtime) {
        return message.error("Không tìm thấy suất chiếu");
      }

      // Tạo dữ liệu update đầy đủ giống DiscountList
      const payload = {
        movie: currentShowtime.movie?._id || currentShowtime.movie,
        cinema: currentShowtime.cinema?._id || currentShowtime.cinema,
        room: currentShowtime.room?._id || currentShowtime.room,
        date: currentShowtime.date,
        time: currentShowtime.time,
        hidden: !checked,
      };

      console.log("Sending update:", payload);

      const res = await apiService.updateShowtime(id, payload);

      if (res.success) {
        message.success(`Đã ${checked ? "Chiếu" : "Ngừng Chiếu"} suất chiếu`);
        setShowtimes(prev =>
          prev.map(s => (s._id === id ? { ...s, hidden: payload.hidden } : s))
        );
      } else {
        message.error(res.error || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error toggle hidden:", error);
      message.error("Không thể cập nhật trạng thái");
    }
  };


  const columns = [
    {
      title: "Ngày chiếu",
      dataIndex: "date",
      key: "date",
      render: (text) => new Date(text).toLocaleDateString("vi-VN"),
    },
    {
      title: "Giờ chiếu",
      dataIndex: "time",
      key: "time",
      render: (text) =>
        new Date(text).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    { title: "Phim", dataIndex: ["movie", "name"], key: "movie" },
    { title: "Rạp", dataIndex: ["cinema", "name"], key: "cinema" },
    { title: "Phòng", dataIndex: ["room", "name"], key: "room" },
    {
      title: "Trạng thái",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden = false, record) => (
        <Switch
          checked={!hidden} // hidden=false => Hiện
          onChange={(checked) => handleToggleHidden(record._id, checked)}
          checkedChildren="Chiếu"
          unCheckedChildren="Ngừng chiếu"
        />
      ),
    },
  ];

  // Tạo suất chiếu
  const handleCreateShowtime = async (values) => {
    try {
      // Chuyển date + time thành ISO string
      const datetime = moment(
        `${values.date.format("YYYY-MM-DD")} ${values.time.format("HH:mm")}`,
        "YYYY-MM-DD HH:mm"
      ).toISOString();

      const payload = {
        movie: values.movie,
        cinema: values.cinema,
        room: values.room,
        date: datetime,
        time: datetime,
        hidden: false, // mặc định hiển thị
      };

      const res = await apiService.createShowtime(payload);

      if (res.success) {
        message.success("Tạo suất chiếu thành công!");
        setIsModalOpen(false);
        form.resetFields();
        fetchShowtimes();
      } else {
        message.error(res.error || "Không thể tạo suất chiếu");
      }
    } catch (error) {
      console.error("Error create showtime:", error);
      message.error("Không thể tạo suất chiếu");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Danh sách suất chiếu</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo phim..."
          value={searchMovie}
          onChange={(e) => setSearchMovie(e.target.value)}
          allowClear
        />
        <Input
          placeholder="Tìm theo rạp..."
          value={searchCinema}
          onChange={(e) => setSearchCinema(e.target.value)}
          allowClear
        />
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          + Thêm suất chiếu
        </Button>
      </Space>

      <Table
        dataSource={filteredShowtimes}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Tạo suất chiếu"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateShowtime}>
          <Form.Item
            name="movie"
            label="Phim"
            rules={[{ required: true, message: "Chọn phim!" }]}
          >
            <Select
              placeholder="Chọn phim"
              options={movies.map((m) => ({ label: m.name, value: m._id }))}
            />
          </Form.Item>

          <Form.Item
            name="cinema"
            label="Rạp"
            rules={[{ required: true, message: "Chọn rạp!" }]}
          >
            <Select
              placeholder="Chọn rạp"
              options={cinemas.map((c) => ({ label: c.name, value: c._id }))}
              onChange={(value) => {
                setSelectedCinema(value);
                form.setFieldsValue({ room: undefined });
              }}
            />
          </Form.Item>

          <Form.Item
            name="room"
            label="Phòng"
            rules={[{ required: true, message: "Chọn phòng!" }]}
          >
            <Select
              placeholder="Chọn phòng"
              options={rooms
                .filter((r) => r.cinema?._id === selectedCinema)
                .map((r) => ({ label: r.name, value: r._id }))}
              disabled={!selectedCinema}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày chiếu"
            rules={[{ required: true, message: "Chọn ngày chiếu!" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Giờ chiếu"
            rules={[{ required: true, message: "Chọn giờ chiếu!" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo suất chiếu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ShowtimeList;
