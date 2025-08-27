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
} from "antd";
import moment from "moment";
import apiService from "../services/ApiService";

function ShowtimeList() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMovie, setSearchMovie] = useState("");
  const [searchCinema, setSearchCinema] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);

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

        // Lọc chỉ lấy phòng active
        const activeRooms = (roomRes.data || []).filter(r => r.status?.trim() === "active");
        setRooms(activeRooms);
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

  // Mở modal thêm suất chiếu
  const openCreateModal = () => {
    setEditingShowtime(null);
    form.resetFields();
    setSelectedCinema(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa suất chiếu
  const openEditModal = (record) => {
    setEditingShowtime(record);
    setSelectedCinema(record.cinema?._id || record.cinema);
    form.setFieldsValue({
      movie: record.movie?._id || record.movie,
      cinema: record.cinema?._id || record.cinema,
      room: record.room?._id || record.room,
      date: moment(record.date),
      time: moment(record.time),
    });
    setIsModalOpen(true);
  };

  // Submit form (thêm / sửa)
  const handleSubmit = async (values) => {
    try {
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
      };

      let res;
      if (editingShowtime) {
        res = await apiService.updateShowtime(editingShowtime._id, payload);
      } else {
        res = await apiService.createShowtime(payload);
      }

      if (res.success) {
        message.success(
          editingShowtime
            ? "Cập nhật suất chiếu thành công!"
            : "Tạo suất chiếu thành công!"
        );
        setIsModalOpen(false);
        form.resetFields();
        setEditingShowtime(null);
        fetchShowtimes();
      } else {
        message.error(res.error || "Không thể xử lý yêu cầu");
      }
    } catch (error) {
      console.error("Error submit showtime:", error);
      message.error("Không thể xử lý yêu cầu");
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
    title: "Hành động",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button type="primary" onClick={() => openEditModal(record)}>
          Sửa
        </Button>
      </Space>
    ),
  },

  ];

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
        <Button type="primary" onClick={openCreateModal}>
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
        title={editingShowtime ? "Sửa suất chiếu" : "Tạo suất chiếu"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingShowtime(null);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
              {editingShowtime ? "Cập nhật" : "Tạo suất chiếu"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ShowtimeList;
