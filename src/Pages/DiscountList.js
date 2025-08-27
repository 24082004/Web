import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Tag, message, Input, Modal, Switch, Badge, Tooltip } from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  EditOutlined, 
  PercentageOutlined, 
  SearchOutlined, 
  EyeOutlined,
  CalendarOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import ApiService from '../services/ApiService';

const { Link: AntLink } = Typography;
const { Search } = Input;

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);

  // Fetch discounts from API
  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getDiscounts();
      
      if (response.success) {
        setDiscounts(response.data);
        setFilteredDiscounts(response.data);
        message.success(`Đã tải ${response.data.length} mã khuyến mãi`);
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách khuyến mãi');
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      message.error('Lỗi kết nối API: ' + error.message);
      setDiscounts([]);
      setFilteredDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality - unified search with safe checks
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredDiscounts(discounts);
    } else {
      const filtered = discounts.filter(discount => {
        // Safe string checks with fallbacks
        const name = discount.name || '';
        const code = discount.code || '';
        
        const searchLower = value.toLowerCase();
        
        return (
          name.toLowerCase().includes(searchLower) ||
          code.toLowerCase().includes(searchLower)
        );
      });
      setFilteredDiscounts(filtered);
    }
  };

  // Reset search to show all discounts
  const handleResetSearch = () => {
    setSearchText('');
    setFilteredDiscounts(discounts);
  };

  // Get discount status
  const getDiscountStatus = (discount) => {
    const now = new Date();
    const startDate = new Date(discount.dayStart);
    const endDate = new Date(discount.dayEnd);
    
    if (discount.status === 'inactive') {
      return 'inactive';
    } else if (now < startDate) {
      return 'upcoming';
    } else if (now > endDate) {
      return 'expired';
    } else {
      return 'active';
    }
  };

  // Get status tag
  const getStatusTag = (status) => {
    switch(status) {
      case 'active':
        return <Tag color="green">Đang hoạt động</Tag>;
      case 'inactive':
        return <Tag color="red">Đã tắt</Tag>;
      case 'upcoming':
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case 'expired':
        return <Tag color="gray">Đã hết hạn</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Handle status change
  const handleStatusChange = async (id, checked) => {
    const newStatus = checked ? 'active' : 'inactive';
    
    setStatusLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      // Find the current discount to get full data
      const currentDiscount = discounts.find(d => d._id === id);
      if (!currentDiscount) {
        throw new Error('Không tìm thấy mã khuyến mãi');
      }

      // Send full discount data with updated status (as backend expects)
      const updateData = {
        name: currentDiscount.name,
        code: currentDiscount.code,
        type: currentDiscount.type,
        percent: currentDiscount.percent,
        dayStart: currentDiscount.dayStart,
        dayEnd: currentDiscount.dayEnd,
        status: newStatus
      };

      const response = await ApiService.updateDiscount(id, updateData);
      
      if (response.success) {
        message.success(`Đã ${checked ? 'kích hoạt' : 'vô hiệu hóa'} mã khuyến mãi`);
        
        // Update local state
        const updatedDiscounts = discounts.map(discount => 
          discount._id === id ? { ...discount, status: newStatus } : discount
        );
        setDiscounts(updatedDiscounts);
        
        // Update filtered discounts
        const updatedFilteredDiscounts = filteredDiscounts.map(discount => 
          discount._id === id ? { ...discount, status: newStatus } : discount
        );
        setFilteredDiscounts(updatedFilteredDiscounts);
      } else {
        message.error(response.message || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating discount status:', error);
      message.error('Lỗi kết nối API: ' + error.message);
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle discount detail view
  const handleViewDetail = (discount) => {
    Modal.info({
      title: 'Thông tin khuyến mãi',
      width: 600,
      content: (
        <div style={{ padding: '16px 0' }}>
          <h3 style={{ marginBottom: 16 }}>
            <TagOutlined style={{ marginRight: 8 }} />
            {discount.name}
          </h3>
          <div style={{ lineHeight: '2' }}>
            <p>
              <PercentageOutlined style={{ marginRight: 8 }} />
              <strong>Phần trăm giảm giá:</strong> {discount.percent}%
            </p>
            <p>
              <strong>Mã code:</strong> <Tag color="blue">{discount.code}</Tag>
            </p>
            <p>
              <strong>Loại khuyến mãi:</strong> {' '}
              {discount.type === 'movie' && <Tag color="magenta">Phim</Tag>}
              {discount.type === 'ticket' && <Tag color="green">Vé</Tag>}
              {discount.type === 'food' && <Tag color="orange">Đồ ăn</Tag>}
              {discount.type === 'combo' && <Tag color="purple">Combo</Tag>}
            </p>
            <p>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <strong>Thời gian:</strong> {moment(discount.dayStart).format('DD/MM/YYYY')} - {moment(discount.dayEnd).format('DD/MM/YYYY')}
            </p>
            <p><strong>Trạng thái:</strong> {' '}
              {getStatusTag(getDiscountStatus(discount))}
            </p>
          </div>
        </div>
      ),
      onOk() {},
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const columns = [
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <AntLink 
          onClick={() => handleViewDetail(record)}
          style={{ fontWeight: 'bold', fontSize: '14px' }}
        >
          {text}
        </AntLink>
      ),
    },
    {
      title: 'Mã code',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <Tag color="blue">{code}</Tag>
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'percent',
      key: 'percent',
      width: 100,
      render: (percent) => (
        <Badge 
          count={`${percent}%`} 
          style={{ 
            backgroundColor: '#52c41a',
            fontWeight: 'bold',
            fontSize: '14px'
          }} 
        />
      ),
      sorter: (a, b) => a.percent - b.percent,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        let color = 'default';
        let text = 'Không xác định';
        
        switch(type) {
          case 'movie':
            color = 'magenta';
            text = 'Phim';
            break;
          case 'ticket':
            color = 'green';
            text = 'Vé';
            break;
          case 'food':
            color = 'orange';
            text = 'Đồ ăn';
            break;
          case 'combo':
            color = 'purple';
            text = 'Combo';
            break;
          default:
            color = 'default';
            text = 'Không xác định';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Phim', value: 'movie' },
        { text: 'Vé', value: 'ticket' },
        { text: 'Đồ ăn', value: 'food' },
        { text: 'Combo', value: 'combo' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <div>
          <div>{moment(record.dayStart).format('DD/MM/YYYY')}</div>
          <div>đến</div>
          <div>{moment(record.dayEnd).format('DD/MM/YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const status = getDiscountStatus(record);
        
        if (status === 'upcoming' || status === 'expired') {
          return (
            <Tooltip title={status === 'upcoming' ? 'Sắp diễn ra' : 'Đã hết hạn'}>
              {getStatusTag(status)}
            </Tooltip>
          );
        }
        
        return (
          <Switch
            checked={record.status === 'active'}
            loading={statusLoading[record._id]}
            onChange={(checked) => handleStatusChange(record._id, checked)}
            disabled={status === 'expired'}
            checkedChildren="Hoạt động"
            unCheckedChildren="Tạm ngưng"
          />
        );
      },
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Đã tắt', value: 'inactive' },
        { text: 'Sắp diễn ra', value: 'upcoming' },
        { text: 'Đã hết hạn', value: 'expired' },
      ],
      onFilter: (value, record) => getDiscountStatus(record) === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="middle"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Link to={`/admin/discount/edit/${record._id}`}>
            <Button 
              type="primary" 
              size="middle"
              icon={<EditOutlined />}
              style={{ 
                backgroundColor: '#1890ff', 
                borderColor: '#1890ff',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(24, 144, 255, 0.3)'
              }}
            >
              Sửa
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <h2 style={{ margin: 0 }}>Danh sách khuyến mãi</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={fetchDiscounts}
            loading={loading}
          >
            Refresh
          </Button>
          <Link to="/admin/discount/add">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm khuyến mãi
            </Button>
          </Link>
        </Space>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên khuyến mãi, mã code" 
          allowClear 
          style={{ maxWidth: 500 }} 
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
        />
        <Button 
          onClick={handleResetSearch}
          disabled={!searchText && filteredDiscounts.length === discounts.length}
        >
          Hiển thị tất cả
        </Button>
        <span style={{ color: '#666' }}>
          Hiển thị {filteredDiscounts.length} / {discounts.length} khuyến mãi
        </span>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredDiscounts}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} khuyến mãi`,
        }}
        bordered
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default DiscountList;