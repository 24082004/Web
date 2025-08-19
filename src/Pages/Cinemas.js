import React, { useEffect, useState } from "react";
import { Table, Button, Space, Typography, message, Input, Modal, Switch, Form } from "antd";
import { ReloadOutlined, EditOutlined, EnvironmentOutlined } from "@ant-design/icons";
import ApiService from "../services/ApiService";

const { Link: AntLink } = Typography;
const { Search } = Input;

const CinemaList = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredCinemas, setFilteredCinemas] = useState([]);

  // Modal edit
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [form] = Form.useForm();

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getCinemas();
      if (response.success) {
        const cinemasWithStatus = response.data.map(c => ({
          ...c,
          status: c.status || 'active'
        }));
        setCinemas(cinemasWithStatus);
        setFilteredCinemas(cinemasWithStatus);
        message.success(`Đã tải ${cinemasWithStatus.length} rạp phim`);
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách rạp phim');
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi kết nối API: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCinemas(); }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) setFilteredCinemas(cinemas);
    else setFilteredCinemas(cinemas.filter(c => 
      c.name.toLowerCase().includes(value.toLowerCase()) || 
      c.address.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const handleStatusChange = async (id, checked) => {
    const newStatus = checked ? 'active' : 'inactive';
    setStatusLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = { success: true }; // tạm thời
      if (response.success) {
        message.success(`Đã ${checked ? 'kích hoạt' : 'vô hiệu hóa'} rạp phim`);
        const update = cinemas.map(c => c._id === id ? { ...c, status: newStatus } : c);
        setCinemas(update);
        setFilteredCinemas(update);
      }
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // --- Modal chỉnh sửa ---
  const showEditModal = (cinema) => {
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
      const updateData = {
        ...values,
        status: values.status ? 'active' : 'inactive'
      };
      const res = await ApiService.updateCinema(editingCinema._id, updateData);
      if (res.success) {
        message.success('Cập nhật rạp thành công');
        setIsModalVisible(false);
        fetchCinemas();
      } else message.error(res.message || 'Cập nhật thất bại');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCinema(null);
  };

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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          loading={statusLoading[record._id]}
          onChange={(checked) => handleStatusChange(record._id, checked)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tạm ngưng"
        />
      ),
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Tạm ngưng', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
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
        title="Chỉnh sửa rạp phim"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên rạp" rules={[{ required: true, message: 'Vui lòng nhập tên rạp' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="hotline" label="Hotline">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm ngưng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CinemaList;
