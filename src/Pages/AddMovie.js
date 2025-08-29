import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, DatePicker, InputNumber, message, Card } from "antd";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

const AddMovie = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dirRes = await axios.get("https://my-backend-api-movie.onrender.com/api/directors");
        const actRes = await axios.get("https://my-backend-api-movie.onrender.com/api/actors");
        const genRes = await axios.get("https://my-backend-api-movie.onrender.com/api/genres");
        
        setDirectors(dirRes.data.data);
        setActors(actRes.data.data);
        setGenres(genRes.data.data.genres);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu đạo diễn / diễn viên / thể loại");
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post("https://my-backend-api-movie.onrender.com/api/movies", values, {
        headers: { "Content-Type": "application/json",
                   "Authorization": `Bearer ${token}`
         }
      });
        console.log("Response:", res.data);

        message.success("Thêm phim mới thành công!");
        navigate("/admin/movie/list");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi thêm phim!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Thêm Phim Mới" bordered={false} style={{ maxWidth: 800, margin: "0 auto" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Tên phim"
          rules={[{ required: true, message: "Vui lòng nhập tên phim" }]}
        >
          <Input maxLength={200} placeholder="Nhập tên phim" />
        </Form.Item>

        <Form.Item
          name="duration"
          label="Thời lượng (HH:MM:SS hoặc số phút)"
          rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
        >
          <Input placeholder="Ví dụ: 02:15:00" />
        </Form.Item>

        <Form.Item
          name="spoken_language"
          label="Ngôn ngữ"
          rules={[{ required: true, message: "Vui lòng nhập ngôn ngữ" }]}
        >
          <Input placeholder="Ví dụ: Tiếng Việt, English" />
        </Form.Item>

        <Form.Item name="image" label="Poster">
          <Input placeholder="URL hình ảnh" />
        </Form.Item>

        <Form.Item name="subtitle" label="Phụ đề">
          <Input placeholder="Ví dụ: English, Vietnamese" />
        </Form.Item>

        <Form.Item name="censorship" label="Phân loại">
          <Select defaultValue="P">
            <Option value="P">P: Phim phù hợp với mọi lứa tuổi</Option>
            <Option value="T13">T13: Phim dành cho khán giả từ 13 tuổi trở lên</Option>
            <Option value="T16">T16: Phim dành cho khán giả từ 16 tuổi trở lên</Option>
            <Option value="T18">T18: Phim dành cho khán giả từ 18 tuổi trở lên</Option>
          </Select>
        </Form.Item>

        <Form.Item name="director" label="Đạo diễn">
          <Select mode="multiple" placeholder="Chọn đạo diễn">
            {directors.map((d) => (
              <Option key={d._id} value={d._id}>{d.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="actor" label="Diễn viên">
          <Select mode="multiple" placeholder="Chọn diễn viên">
            {actors.map((a) => (
              <Option key={a._id} value={a._id}>{a.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="genre" label="Thể loại">
          <Select mode="multiple" placeholder="Chọn thể loại">
            {genres.map((g) => (
              <Option key={g._id} value={g._id}>{g.name}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="rating"
          label="Đánh giá (0 - 10)"
          rules={[
            { required: true, message: "Vui lòng nhập đánh giá" },
            { type: "number", min: 0, max: 10, message: "Đánh giá phải trong khoảng 0 - 10" }
          ]}
        >
          <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} placeholder="Ví dụ: 8.5" />
        </Form.Item>


        <Form.Item name="trailer" label="Trailer">
          <Input placeholder="URL trailer" />
        </Form.Item>

        <Form.Item name="storyLine" label="Nội dung phim">
          <TextArea rows={4} maxLength={2000} />
        </Form.Item>

        <Form.Item name="release_date" label="Ngày phát hành">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái">
          <Select defaultValue="active">
            <Option value="active">Kích hoạt</Option>
            <Option value="inactive">Ngừng chiếu</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm phim
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddMovie;
