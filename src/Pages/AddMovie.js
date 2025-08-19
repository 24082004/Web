import React from "react";
import { Form, Input, Button, Select, DatePicker, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import apiService from "../services/ApiService";

const { TextArea } = Input;
const { Option } = Select;

const AddMovie = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const formData = new FormData();

      // Thêm các trường giống MovieList
      formData.append("name", values.name);
      formData.append("durationFormatted", values.durationFormatted || "");
      formData.append("ageLimit", values.ageLimit || "");
      formData.append("rating", values.rating || "");
      formData.append("subtitle", values.subtitle || "");
      formData.append("description", values.description || "");
      formData.append("format", values.format || "");
      formData.append(
        "releaseDate",
        values.releaseDate ? values.releaseDate.format("YYYY-MM-DD") : ""
      );

      // Các trường mảng
      if (values.languages) values.languages.forEach(lang => formData.append("languages[]", lang));
      if (values.genres) values.genres.forEach(genre => formData.append("genres[]", genre));
      if (values.actors) values.actors.forEach(actor => formData.append("actors[]", actor));
      if (values.directors) values.directors.forEach(dir => formData.append("directors[]", dir));

      // Upload hình ảnh
      if (values.image && values.image.fileList.length > 0) {
        formData.append("image", values.image.fileList[0].originFileObj);
      }

      // Upload trailer
      if (values.trailer && values.trailer.fileList.length > 0) {
        formData.append("trailer", values.trailer.fileList[0].originFileObj);
      }

      const res = await apiService.createMovie(formData);
      if (res.success) {
        message.success("Thêm phim thành công!");
        form.resetFields();
      } else {
        message.error(res.message || "Thêm phim thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi thêm phim: " + err.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Thêm Phim Mới</h2>
      <Form layout="vertical" form={form} onFinish={onFinish} style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Tên phim + Thời lượng */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item label="Tên phim" name="name" style={{ flex: 1 }} rules={[{ required: true, message: "Vui lòng nhập tên phim!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Thời lượng" name="durationFormatted" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>

        {/* Độ tuổi + Đánh giá */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item label="Độ tuổi" name="ageLimit" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item label="Đánh giá" name="rating" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>

        {/* Ngôn ngữ + Phụ đề */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item label="Ngôn ngữ" name="languages" style={{ flex: 1 }}>
            <Select mode="multiple" placeholder="Chọn ngôn ngữ" allowClear>
              <Option value="Vietnamese">Tiếng Việt</Option>
              <Option value="English">Tiếng Anh</Option>
              <Option value="Korean">Tiếng Hàn</Option>
              <Option value="Japanese">Tiếng Nhật</Option>
              <Option value="Chinese">Tiếng Trung</Option>
              <Option value="French">Tiếng Pháp</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Phụ đề" name="subtitle" style={{ flex: 1 }}>
            <Input defaultValue="Vietnamese" />
          </Form.Item>
        </div>

        {/* Cốt truyện */}
        <Form.Item label="Cốt truyện" name="description">
          <TextArea rows={3} />
        </Form.Item>

        {/* Thể loại + Định dạng */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item label="Thể loại" name="genres" style={{ flex: 1 }}>
            <Select mode="multiple" placeholder="Chọn thể loại" allowClear>
              <Option value="Hành Động">Hành Động</Option>
              <Option value="Kinh Dị">Kinh Dị</Option>
              <Option value="Anime">Anime</Option>
              <Option value="Hoạt Hình">Hoạt Hình</Option>
              <Option value="Tình Cảm">Tình Cảm</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Định dạng phim" name="format" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>

        {/* Diễn viên + Đạo diễn */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item label="Diễn viên" name="actors" style={{ flex: 1 }}>
            <Select mode="multiple" placeholder="Chọn diễn viên" allowClear />
          </Form.Item>
          <Form.Item label="Đạo diễn" name="directors" style={{ flex: 1 }}>
            <Select mode="multiple" placeholder="Chọn đạo diễn" allowClear />
          </Form.Item>
        </div>

        {/* Ngày phát hành */}
        <Form.Item label="Ngày phát hành" name="releaseDate">
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        {/* Hình ảnh + Trailer */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item label="Hình ảnh" name="image" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn tệp</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Trailer" name="trailer" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn tệp</Button>
            </Upload>
          </Form.Item>
        </div>

        {/* Nút submit + reset */}
        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Thêm phim
          </Button>
          <Button type="default" onClick={() => form.resetFields()}>
            Quay lại
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddMovie;
