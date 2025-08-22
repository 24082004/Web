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

  // 🔹 Lấy danh sách director / actor / genre từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dirRes = await axios.get("https://my-backend-api-movie.onrender.com/api/directors");
        const actRes = await axios.get("https://my-backend-api-movie.onrender.com/api/actors");
        const genRes = await axios.get("https://my-backend-api-movie.onrender.com/api/genres");
        
        setDirectors(dirRes.data.data);
        //console.log("check director >> ", directors);
        setActors(actRes.data.data);
        setGenres(genRes.data.data.genres);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu đạo diễn / diễn viên / thể loại");
      }
    };
    fetchData();
  }, []);

  // 🔹 Gửi request thêm phim
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post("https://my-backend-api-movie.onrender.com/api/movies", values, {
        headers: { "Content-Type": "application/json",
                   "Authorization": `Bearer ${token}`
         }
      });
      // log dữ liệu backend trả về
        console.log("Response:", res.data);

        message.success("Thêm phim mới thành công!");

        // điều hướng về màn hình danh sách phim
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
        {/* 🟢 Bắt buộc */}
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
          <Input placeholder="Ví dụ: 02:15:00 hoặc 135" />
        </Form.Item>

        <Form.Item
          name="spoken_language"
          label="Ngôn ngữ"
          rules={[{ required: true, message: "Vui lòng nhập ngôn ngữ" }]}
        >
          <Input placeholder="Ví dụ: Tiếng Việt, English" />
        </Form.Item>

        {/* 🟡 Tùy chọn */}
        <Form.Item name="image" label="Poster">
          <Input placeholder="URL hình ảnh" />
        </Form.Item>

        <Form.Item name="subtitle" label="Phụ đề">
          <Input placeholder="Ví dụ: English, Vietnamese" />
        </Form.Item>

        <Form.Item name="censorship" label="Phân loại">
          <Select defaultValue="P">
            <Option value="G">G</Option>
            <Option value="PG">PG</Option>
            <Option value="PG-13">PG-13</Option>
            <Option value="R">R</Option>
            <Option value="NC-17">NC-17</Option>
            <Option value="P">P</Option>
            <Option value="K">K</Option>
            <Option value="T13">T13</Option>
            <Option value="T16">T16</Option>
            <Option value="T18">T18</Option>
            <Option value="C">C</Option>
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

        <Form.Item name="trailer" label="Trailer">
          <Input placeholder="URL trailer" />
        </Form.Item>

        <Form.Item name="rate" label="Đánh giá">
          <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="storyLine" label="Nội dung phim">
          <TextArea rows={4} maxLength={2000} />
        </Form.Item>

        <Form.Item name="release_date" label="Ngày phát hành">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="release_at" label="Thời gian chiếu / Rạp">
          <Input placeholder="Ví dụ: CGV, 20:00" />
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
