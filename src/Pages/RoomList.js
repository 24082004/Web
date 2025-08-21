import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Card, 
  message, 
  Input, 
  Select, 
  Modal,
  Tag, 
  Form,
  Row,
  Col
} from 'antd';
import { 
  ReloadOutlined,
  BankOutlined,
  PlusOutlined,
  EditOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import ApiService from '../services/ApiService';

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Modal sửa phòng
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm] = Form.useForm();
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal thêm phòng
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);
  const [addForm] = Form.useForm();

  // ===== Fetch rooms =====
  const fetchRooms = async (cinemaId = null) => {
    setLoading(true);
    try {
      const response = await ApiService.getRooms(cinemaId);
      if (response.success) {
        setRooms(response.data);
        setFilteredRooms(response.data);
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách phòng chiếu');
      }
    } catch (error) {
      message.error('Lỗi kết nối API: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCinemas = async () => {
    setLoadingCinemas(true);
    try {
      const response = await ApiService.getCinemas();
      if (response.success) {
        setCinemas(response.data);
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách rạp phim');
      }
    } catch (error) {
      message.error('Lỗi kết nối API: ' + error.message);
    } finally {
      setLoadingCinemas(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchCinemas();
  }, []);

  // ===== Search & Filter =====
  const handleSearch = (value) => {
    setSearchText(value);
    filterRooms(value);
  };

  const handleCinemaChange = (value) => {
    setSelectedCinema(value);
    fetchRooms(value === 'all' ? null : value);
  };

  const filterRooms = (text) => {
    let filtered = [...rooms];
    if (text) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(text.toLowerCase()) ||
        (room.cinema && room.cinema.name.toLowerCase().includes(text.toLowerCase()))
      );
    }
    setFilteredRooms(filtered);
  };

  // ===== Validate trùng tên =====
  const isDuplicateRoomName = (name, cinemaId, currentRoomId = null) => {
    return rooms.some(room =>
      room.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      room.cinema?._id === cinemaId &&
      room._id !== currentRoomId
    );
  };

  // ===== Edit room =====
  const handleEdit = (room) => {
    setEditingRoom(room);
    editForm.setFieldsValue({
      name: room.name,
      cinema: room.cinema?._id || null,
      status: room.status || "active",
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      setSavingEdit(true);
      const response = await ApiService.updateRoom(editingRoom._id, values);
      if (response.success) {
        message.success("Cập nhật phòng chiếu thành công");
        setEditModalVisible(false);
        fetchRooms(selectedCinema === "all" ? null : selectedCinema);
      } else {
        message.error(response.message || "Lỗi khi cập nhật phòng chiếu");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSavingEdit(false);
    }
  };

  // ===== Columns =====
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Text strong style={{ cursor: 'default', color: '#1890ff' }}>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          {text}
        </Text>
      ),
    },
    {
      title: 'Rạp',
      dataIndex: 'cinema',
      key: 'cinema',
      render: (cinema) => cinema ? (
        <div>
          <Tag color="blue"><BankOutlined /> {cinema.name}</Tag>
          <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
            {cinema.address || 'Chưa cập nhật địa chỉ'}
          </div>
        </div>
      ) : 'Không có thông tin',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          active: { color: 'green', text: 'Hoạt động' },
          maintenance: { color: 'orange', text: 'Bảo trì' },
          inactive: { color: 'red', text: 'Ngưng hoạt động' }
        };
        const config = statusConfig[status] || statusConfig.active;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>🏢 Danh sách phòng chiếu</Title>
        <Space>
          <Button type="default" icon={<ReloadOutlined />} onClick={() => fetchRooms(selectedCinema === 'all' ? null : selectedCinema)} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            Thêm phòng
          </Button>
        </Space>
      </div>

      {/* Filter */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Tìm kiếm</Text>
            <Search placeholder="Tìm kiếm theo tên phòng, rạp..." allowClear value={searchText} onChange={(e) => handleSearch(e.target.value)} onSearch={handleSearch} />
          </Col>
          <Col span={12}>
            <Text strong>Lọc theo rạp</Text>
            <Select style={{ width: '100%' }} placeholder="Chọn rạp" loading={loadingCinemas} value={selectedCinema} onChange={handleCinemaChange}>
              <Option value="all">Tất cả các rạp</Option>
              {cinemas.map(cinema => (
                <Option key={cinema._id} value={cinema._id}>{cinema.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Table 
        columns={columns} 
        dataSource={filteredRooms} 
        rowKey="_id" 
        loading={loading} 
        pagination={{ pageSize: 10, showSizeChanger: true }} 
        bordered 
        scroll={{ x: 800 }} 
      />

      {/* Modal thêm phòng */}
      <Modal
        title="Thêm phòng chiếu"
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={async () => {
          try {
            const values = await addForm.validateFields();
            setAddingRoom(true);
            const response = await ApiService.createRoom(values);
            if (response.success) {
              message.success("Thêm phòng chiếu thành công");
              setAddModalVisible(false);
              addForm.resetFields();
              fetchRooms(selectedCinema === "all" ? null : selectedCinema);
            } else {
              message.error(response.message || "Lỗi khi thêm phòng chiếu");
            }
          } catch (error) {
            console.error(error);
          } finally {
            setAddingRoom(false);
          }
        }}
        confirmLoading={addingRoom}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên phòng"
            rules={[
              { required: true, message: "Vui lòng nhập tên phòng" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const cinemaId = getFieldValue('cinema');
                  if (!cinemaId) return Promise.resolve();
                  if (isDuplicateRoomName(value, cinemaId)) {
                    return Promise.reject(new Error("Tên phòng này đã tồn tại trong rạp đã chọn"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="cinema" label="Rạp" rules={[{ required: true, message: "Vui lòng chọn rạp" }]}>
            <Select placeholder="Chọn rạp">
              {cinemas.map((cinema) => (
                <Select.Option key={cinema._id} value={cinema._id}>
                  {cinema.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="active">
            <Select>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="maintenance">Bảo trì</Select.Option>
              <Select.Option value="inactive">Ngưng hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa phòng */}
      <Modal 
        title="Chỉnh sửa phòng chiếu" 
        visible={editModalVisible} 
        onCancel={() => setEditModalVisible(false)} 
        onOk={handleSaveEdit} 
        confirmLoading={savingEdit}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên phòng"
            rules={[
              { required: true, message: "Vui lòng nhập tên phòng" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const cinemaId = getFieldValue('cinema');
                  if (!cinemaId) return Promise.resolve();
                  if (isDuplicateRoomName(value, cinemaId, editingRoom?._id)) {
                    return Promise.reject(new Error("Tên phòng này đã tồn tại trong rạp đã chọn"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="cinema" label="Rạp" rules={[{ required: true, message: "Vui lòng chọn rạp" }]}>
            <Select placeholder="Chọn rạp">
              {cinemas.map((cinema) => (
                <Select.Option key={cinema._id} value={cinema._id}>
                  {cinema.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="maintenance">Bảo trì</Select.Option>
              <Select.Option value="inactive">Ngưng hoạt động</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomList;
