// src/pages/EditMovie.js
import React, { useEffect, useState, useCallback } from "react";
import { Form, Input, Button, message, DatePicker, Select, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import dayjs from "dayjs";

const { Option } = Select;

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [directorsList, setDirectorsList] = useState([]);
  const [actorsList, setActorsList] = useState([]);
  const [genres, setGenres] = useState([]);

  const fetchPeople = useCallback(async () => {
    try {
      const resActors = await ApiService.request("/actors");
      const resDirectors = await ApiService.request("/directors");
      const genRes = await ApiService.request("/genres");
      if (resActors.success) setActorsList(resActors.data || []);
      if (resDirectors.success) setDirectorsList(resDirectors.data || []);
      if (genRes.success) setGenres(genRes.data.genres || []);
    } catch (err) {
      message.error("Lỗi tải danh sách đạo diễn / diễn viên");
    }
  }, []);

  const fetchMovie = useCallback(async () => {
    try {
      const response = await ApiService.request(`/movies/${id}`);
      if (!response.success) {
        message.error(response.message || "Không lấy được thông tin phim");
        return;
      }
      const data = response.data;
      //console.log("check data >>", data);

      

      form.setFieldsValue({
        name: data.name,
        subtitle: data.subtitle,
        censorship: data.censorship,
        duration: data.duration,
        rate: data.rate,
        release_date: data.release_date ? dayjs(data.release_date) : null,
        actor: (data.actor || []).map(d => d._id || d),
        genre: (data.genre || []).map(d => d._id || d),
        director: (data.director || []).map(d => d._id || d),
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phim:", error);
      message.error("Lỗi khi lấy thông tin phim");
    }
  }, [id, form]);

  useEffect(() => {
    // Đảm bảo load danh sách trước rồi mới set form
    const loadData = async () => {
      await fetchPeople();
      await fetchMovie();
    };
    loadData();
  }, [fetchPeople, fetchMovie]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        release_date: values.release_date
          ? values.release_date.toISOString()
          : null,
      };
      const res = await ApiService.request(`/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.success) {
        message.success("Cập nhật phim thành công");
        navigate("/admin/movie/list");
      } else {
        message.error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      message.error("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <h2>Sửa phim</h2>
      {loading && <Spin style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Tên phim"
          rules={[{ required: true, message: "Vui lòng nhập tên phim" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="subtitle" label="Phụ đề">
          <Input />
        </Form.Item>

        <Form.Item
          name="censorship"
          label="Phân loại"
          rules={[{ required: true, message: "Vui lòng chọn phân loại" }]}
        >
          <Select allowClear>
            <Option value="P">P</Option>
            <Option value="T13">T13</Option>
            <Option value="T16">T16</Option>
            <Option value="T18">T18</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="duration"
          label="Thời lượng"
          rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
        >
          <Input placeholder="vd: 02:30:00" />
        </Form.Item>

        <Form.Item name="rate" label="Đánh giá">
          <Input type="number" step="0.1" />
        </Form.Item>

        <Form.Item
          name="release_date"
          label="Ngày phát hành"
          rules={[{ required: true, message: "Vui lòng chọn ngày phát hành" }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>

        {/* Đạo diễn */}
        <Form.Item
          name="director"
          label="Đạo diễn"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 đạo diễn" }]}
        >
          <Select mode="multiple" placeholder="Chọn đạo diễn">
            {directorsList.map((dir) => (
              <Option key={dir._id} value={dir._id}>
                {dir.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Diễn viên */}
        <Form.Item
          name="actor"
          label="Diễn viên"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 diễn viên" }]}
        >
          <Select mode="multiple" placeholder="Chọn diễn viên">
            {actorsList.map((actor) => (
              <Option key={actor._id} value={actor._id}>
                {actor.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="genre"
          label="Thể loại"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 diễn viên" }]}
        >
          <Select mode="multiple" placeholder="Chọn thể loại">
              {genres.map((g) => (
                <Option key={g._id} value={g._id}>{g.name}</Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu thay đổi
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => navigate("/admin/movie/list")}
          >
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditMovie;
