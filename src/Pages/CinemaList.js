// src/Pages/CinemaList.js
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Typography, message, Input, Modal, Form } from "antd";
import { ReloadOutlined, EditOutlined, EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import ApiService from "../services/ApiService";

const { Link: AntLink } = Typography;
const { Search } = Input;

const CinemaList = () => {
  const [cinemas, setCinemas] = useState([]);
  const [filteredCinemas, setFilteredCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [searchText, setSearchText] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();

  // --- Fetch danh sách rạp ---
  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getCinemas();
      if (response.success) {
        const cinemasWithStatus = response.data.map(c => ({ ...c, status: c.status || 'active' }));
        setCinemas(cinemasWithStatus);
        setFilteredCinemas(cinemasWithStatus);
      }
    } catch (err) {
      message.error('Lỗi kết nối API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCinemas(); }, []);

  // --- Search/filter admin ---
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) setFilteredCinemas(cinemas);
    else setFilteredCinemas(cinemas.filter(c =>
      c.name.toLowerCase().includes(value.toLowerCase()) ||
      c.address.toLowerCase().includes(value.toLowerCase())
    ));
  };

  // --- Thay đổi trạng thái ---
  const handleStatusChange = async (id, newStatus) => {
    const cinema = cinemas.find(c => c._id === id);
    if (!cinema) return;

    const updatedCinema = { ...cinema, status: newStatus };

    setStatusLoading(prev => ({ ...prev, [id]: true }));

    try {
      const response = await ApiService.updateCinema(id, updatedCinema);

      if (response.success) {
        message.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} rạp phim`);
        const updatedList = cinemas.map(c => c._id === id ? { ...c, status: newStatus } : c);
        setCinemas(updatedList);
        setFilteredCinemas(updatedList);
      } else {
        message.error(response.message || 'Cập nhật trạng thái thất bại');
      }

    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // --- Kiểm tra trùng ---
  const checkDuplicate = (field, value) => {
    const filtered = cinemas.filter(c => !isAdding && editingCinema ? c._id !== editingCinema._id : true);
    return filtered.some(c => c[field]?.trim().toLowerCase() === value.trim().toLowerCase());
  };

  // --- Modal thêm mới ---
  const showAddModal = () => {
    setIsAdding(true);
    setEditingCinema(null);
    form.resetFields();
    form.setFieldsValue({ status: true }); // mặc định hoạt động
    setIsModalVisible(true);
  };

  // --- Modal chỉnh sửa ---
  const showEditModal = (cinema) => {
    setIsAdding(false);
    setEditingCinema(cinema);
    form.setFieldsValue({
      name: cinema.name,
      address: cinema.address,
      hotline: cinema.hotline,
      status: cinema.status === 'active'
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const cinemaData = {
        ...values,
        status: values.status ? 'active' : 'inactive'
      };

      let res;
      if (isAdding) {
        res = await ApiService.createCinema(cinemaData);
      } else {
        res = await ApiService.updateCinema(editingCinema._id, cinemaData);
      }

      if (res.success) {
        message.success(isAdding ? 'Thêm rạp thành công' : 'Cập nhật rạp thành công');
        setIsModalVisible(false);
        setIsAdding(false);
        fetchCinemas();
      } else {
        message.error(res.message || 'Thao tác thất bại');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCinema(null);
    setIsAdding(false);
  };

  // --- Columns ---
  const columns = [
    {
      title: 'Tên rạp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <AntLink onClick={() => showEditModal(record)} style={{ fontWeight: 'bold', fontSize: '14px' }}>
          {text}
        </AntLink>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <div style={{ maxWidth: 350, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <EnvironmentOutlined style={{ marginRight: 5, color: '#1890ff' }} />
          {address}
        </div>
      ),
    },
    {
      title: 'Hotline',
      dataIndex: 'hotline',
      key: 'hotline',
      width: 150,
      render: (hotline) => hotline || 'Chưa cập nhật',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Danh sách rạp phim</h2>
        <Space>
          <Button type="primary" icon={<ReloadOutlined />} onClick={fetchCinemas} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm rạp
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên rạp hoặc địa chỉ..."
          allowClear
          style={{ maxWidth: 400 }}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
        />
        <span style={{ marginLeft: 16, color: '#666' }}>
          Hiển thị {filteredCinemas.length} / {cinemas.length} rạp phim
        </span>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCinemas}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
        bordered
        scroll={{ x: 1000 }}
      />

      <Modal
        title={isAdding ? "Thêm rạp phim" : "Chỉnh sửa rạp phim"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên rạp"
            rules={[
              { required: true, message: 'Vui lòng nhập tên rạp' },
              { validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (checkDuplicate('name', value)) return Promise.reject(new Error('Tên rạp đã tồn tại'));
                  return Promise.resolve();
              }}
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ' },
              { validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (checkDuplicate('address', value)) return Promise.reject(new Error('Địa chỉ đã tồn tại'));
                  return Promise.resolve();
              }}
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="hotline"
            label="Hotline"
            rules={[
              { required: true, message: 'Vui lòng nhập số hotline' },
              { validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (!/^\d{10,11}$/.test(value)) return Promise.reject(new Error('Hotline phải từ 10-11 số'));
                  if (checkDuplicate('hotline', value)) return Promise.reject(new Error('Hotline đã tồn tại'));
                  return Promise.resolve();
              }}
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// --- API cho app người dùng: chỉ hiển thị rạp active ---
export const fetchCinemasForApp = async () => {
  const res = await ApiService.getCinemas();
  if (res.success) {
    return res.data.filter(c => c.status === 'active');
  }
  return [];
};

export default CinemaList;
