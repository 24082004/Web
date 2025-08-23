import React, { useEffect, useState, useCallback } from "react";
import { Form, Input, Button, message,InputNumber, DatePicker, Select, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import dayjs from "dayjs";

const { TextArea } = Input;
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

      form.setFieldsValue({
        name: data.name,
        spoken_language:data.spoken_language,
        image: data.image,
        subtitle: data.subtitle,
        censorship: data.censorship,
        duration: data.duration,
        trailer: data.trailer,
        storyLine: data.storyLine,
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

        <Form.Item name="storyLine" label="Nội dung phim">
          <TextArea rows={4} maxLength={2000} />
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
          <Input />
        </Form.Item>

        <Form.Item name="censorship" label="Phân loại">
          <Select defaultValue="P">
            <Option value="P">P: Phim phù hợp với mọi lứa tuổi</Option>
            <Option value="C13">C13: Phim dành cho khán giả từ 13 tuổi trở lên</Option>
            <Option value="C16">C16: Phim dành cho khán giả từ 16 tuổi trở lên</Option>
            <Option value="C18">C18: Phim dành cho khán giả từ 18 tuổi trở lên</Option>
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
          <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="release_date"
          label="Ngày phát hành"
          rules={[{ required: true, message: "Vui lòng chọn ngày phát hành" }]}
        >
          <DatePicker disabled format="DD/MM/YYYY" />
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

        <Form.Item name="trailer" label="Trailer">
          <Input placeholder="URL trailer" />
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
