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
  Badge, 
  Tag, 
  Modal,
  Row,
  Col,
  Form,
  Divider
} from 'antd';
import { 
  ReloadOutlined,
  BankOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm] = Form.useForm();
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchRooms = async (cinemaId = null) => {
    setLoading(true);
    try {
      const response = await ApiService.getRooms(cinemaId);
      if (response.success) {
        setRooms(response.data);
        setFilteredRooms(response.data);
        message.success(`Đã tải ${response.data.length} phòng chiếu`);
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách phòng chiếu');
      }
    } catch (error) {
      message.error('Lỗi kết nối API: ' + error.message);
      const fallbackData = [
        {
          _id: '1',
          name: 'Phòng 1',
          cinema: { _id: '1', name: 'CGV Vincom Center', address: 'Bà Triệu, Hà Nội' },
          currentMovie: 'Quá Nhanh Quá Nguy Hiểm',
          showtimes: ['2024-08-06 - 07:00', '2024-08-06 - 18:00', '2024-08-06 - 22:30'],
          seatCount: 120,
          status: 'active'
        }
      ];
      setRooms(fallbackData);
      setFilteredRooms(fallbackData);
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
        setCinemas([]);
      }
    } catch (error) {
      message.error('Lỗi kết nối API: ' + error.message);
      setCinemas([{ _id: '1', name: 'CGV Vincom Center' }]);
    } finally {
      setLoadingCinemas(false);
    }
  };

  const fetchRoomDetails = async (roomId) => {
    setLoadingDetails(true);
    try {
      const response = await ApiService.getRoomById(roomId);
      if (response.success) {
        setRoomDetails(response.data);
      } else {
        message.error(response.message || 'Lỗi khi tải chi tiết phòng chiếu');
      }
    } catch (error) {
      message.error('Lỗi kết nối API: ' + error.message);
      const mockSeats = Array.from({ length: selectedRoom?.seatCount || 20 }, (_, i) => ({
        _id: `seat_${i + 1}`,
        seatNumber: `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`,
        type: i < 5 ? 'vip' : i < 10 ? 'couple' : 'normal',
        row: String.fromCharCode(65 + Math.floor(i / 10)),
        column: (i % 10) + 1,
        status: Math.random() > 0.8 ? 'occupied' : 'available'
      }));
      setRoomDetails({
        room: selectedRoom,
        seats: mockSeats,
        seatCount: mockSeats.length
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchCinemas();
  }, []);

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
        (room.cinema && room.cinema.name.toLowerCase().includes(text.toLowerCase())) ||
        (room.currentMovie && room.currentMovie.toLowerCase().includes(text.toLowerCase()))
      );
    }
    setFilteredRooms(filtered);
  };

  const handleViewDetail = (room) => {
    setSelectedRoom(room);
    fetchRoomDetails(room._id);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedRoom(null);
    setRoomDetails(null);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    editForm.setFieldsValue({
      name: room.name,
      cinema: room.cinema?._id || null,
      currentMovie: room.currentMovie || "",
      seatCount: room.seatCount || 0,
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
      render: (text, record) => (
        <Text strong style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => handleViewDetail(record)}>
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
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            <EnvironmentOutlined /> {cinema.address || 'Chưa cập nhật địa chỉ'}
          </div>
        </div>
      ) : 'Không có thông tin',
    },
    {
      title: 'Phim đang chiếu',
      dataIndex: 'currentMovie',
      key: 'currentMovie',
      render: (movie) => movie ? (
        <Tag color="green">
          <VideoCameraOutlined /> {movie}
        </Tag>
      ) : (
        <Tag color="default">Chưa có phim</Tag>
      ),
    },
    {
      title: 'Thời gian chiếu',
      dataIndex: 'showtimes',
      key: 'showtimes',
      render: (times) => times && times.length > 0 ? (
        <div>
          {times.slice(0, 2).map((time, index) => (
            <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
              <ClockCircleOutlined /> {time}
            </Tag>
          ))}
          {times.length > 2 && (
            <Tag color="default">+{times.length - 2} khung giờ khác</Tag>
          )}
        </div>
      ) : (
        <Text type="secondary">Chưa có lịch chiếu</Text>
      ),
    },
    {
      title: 'Số ghế',
      dataIndex: 'seatCount',
      key: 'seatCount',
      width: 100,
      render: (count) => (
        <Badge count={count || 0} style={{ backgroundColor: '#52c41a' }} overflowCount={999} />
      ),
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>🏢 Danh sách phòng chiếu</Title>
        <Space>
          <Button type="default" icon={<ReloadOutlined />} onClick={() => fetchRooms(selectedCinema === 'all' ? null : selectedCinema)} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('Chức năng thêm phòng chiếu')}>
            Thêm phòng
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Tìm kiếm</Text>
            <Search placeholder="Tìm kiếm theo tên phòng, rạp, phim..." allowClear value={searchText} onChange={(e) => handleSearch(e.target.value)} onSearch={handleSearch} />
          </Col>
          <Col span={8}>
            <Text strong>Lọc theo rạp</Text>
            <Select style={{ width: '100%' }} placeholder="Chọn rạp" loading={loadingCinemas} value={selectedCinema} onChange={handleCinemaChange}>
              <Option value="all">Tất cả các rạp</Option>
              {cinemas.map(cinema => (
                <Option key={cinema._id} value={cinema._id}>{cinema.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Thống kê</Text>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Badge count={filteredRooms.length} style={{ backgroundColor: '#1890ff' }} />
              <Text>Tổng số phòng</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <div style={{ marginBottom: 16 }}>
        <Text>Hiển thị <Text strong>{filteredRooms.length}</Text> / <Text strong>{rooms.length}</Text> phòng chiếu</Text>
      </div>

      <Table columns={columns} dataSource={filteredRooms} rowKey="_id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phòng chiếu` }} bordered scroll={{ x: 1200 }} />

      {/* Modal Chi tiết */}
      <Modal title={<><BankOutlined /> Chi tiết phòng chiếu</>} visible={detailModalVisible} onCancel={handleCloseDetailModal} footer={[<Button key="close" onClick={handleCloseDetailModal}>Đóng</Button>]} width={800}>
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>Đang tải thông tin...</div>
        ) : roomDetails ? (
          <div>
            <Title level={4}>{roomDetails.room?.name || selectedRoom?.name}</Title>
            <p><BankOutlined /> {roomDetails.room?.cinema?.name || selectedRoom?.cinema?.name}</p>
            <p><EnvironmentOutlined /> {roomDetails.room?.cinema?.address || selectedRoom?.cinema?.address}</p>
            <Divider />
            <Text strong>Phim đang chiếu: </Text> {roomDetails.room?.currentMovie || selectedRoom?.currentMovie || 'Chưa có phim'}<br />
            <Text strong>Số ghế: </Text> {roomDetails.seatCount}
            <Divider />
            <Text strong>Lịch chiếu:</Text>
            <div style={{ marginTop: 8 }}>
              {(roomDetails.room?.showtimes || selectedRoom?.showtimes || []).map((time, idx) => (
                <Tag key={idx} color="orange" style={{ marginBottom: 4 }}>
                  <ClockCircleOutlined /> {time}
                </Tag>
              ))}
            </div>
            <Divider />
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>Không có thông tin chi tiết</div>
        )}
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal title="Chỉnh sửa phòng chiếu" visible={editModalVisible} onCancel={() => setEditModalVisible(false)} onOk={handleSaveEdit} confirmLoading={savingEdit}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Tên phòng" rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}>
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
          <Form.Item name="currentMovie" label="Phim đang chiếu">
            <Input />
          </Form.Item>
          <Form.Item name="seatCount" label="Số ghế" rules={[{ required: true, message: "Vui lòng nhập số ghế" }]}>
            <Input type="number" />
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
