import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Descriptions,
  Tag,
  Button,
  Spin,
  message,
  Typography,
  Divider,
  Space,
  Table,
  Empty,
  Tabs,
  Statistic
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  HistoryOutlined,
  ScanOutlined,
  TrophyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanStats, setScanStats] = useState({
    totalScanned: 0,
    todayScanned: 0,
    thisMonthScanned: 0,
    validScanned: 0
  });

  // Fetch employee details
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getUserById(id);
      
      if (response.success) {
        setEmployee(response.data);
        // Nếu là nhân viên, lấy lịch sử quét vé
        if (response.data.role === 'employee') {
          fetchScanHistory();
        }
      } else {
        message.error(response.error || 'Không thể lấy thông tin nhân viên');
        navigate('/admin/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      message.error('Lỗi kết nối API');
      navigate('/admin/employees');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch scan history for this employee
  const fetchScanHistory = async () => {
    try {
      setScanLoading(true);
      
      console.log('Fetching scan history for employee ID:', id);
      console.log('ApiService baseURL:', ApiService.getBaseURL());
      
      // ✅ SỬ DỤNG ApiService thay vì hardcode URL
      let data;
      
      try {
        // Thử endpoint admin trước với ApiService method mới
        console.log('Trying admin endpoint...');
        data = await ApiService.getEmployeeScanHistory(id);
        console.log('Admin endpoint success:', data);
      } catch (adminError) {
        console.error('Admin endpoint failed:', adminError);
        
        // ✅ FALLBACK: Lấy tất cả scan history và filter client-side
        console.log('Trying fallback: get all scan history and filter...');
        try {
          const allScanData = await ApiService.getScanHistory();
          console.log('All scan history:', allScanData);
          
          // Filter theo employeeId
          const filteredHistory = (allScanData.data || []).filter(item => 
            item.scannedBy === id ||
item.employeeId === id ||
            item.scannedByEmployeeId === id
          );
          
          console.log('Filtered history for employee:', filteredHistory);
          data = { data: filteredHistory };
        } catch (fallbackError) {
          console.error('Fallback failed:', fallbackError);
          setScanHistory([]);
          message.error('Không thể tải lịch sử quét vé. Kiểm tra kết nối server.');
          return;
        }
      }

      if (data && data.data) {
        setScanHistory(data.data || []);
        
        // Tính toán statistics
        const history = data.data || [];
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const stats = {
          totalScanned: history.length,
          todayScanned: history.filter(item => 
            new Date(item.scanTime).toISOString().split('T')[0] === today
          ).length,
          thisMonthScanned: history.filter(item => {
            const scanDate = new Date(item.scanTime);
            return scanDate.getMonth() === thisMonth && scanDate.getFullYear() === thisYear;
          }).length,
          validScanned: history.filter(item => item.status === 'used').length
        };

        console.log('Calculated stats:', stats);
        setScanStats(stats);
      } else {
        console.log('No scan history data found');
        setScanHistory([]);
      }
    } catch (error) {
      console.error('Error fetching scan history:', error);
      setScanHistory([]);
      message.error('Lỗi khi tải lịch sử quét vé');
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/admin/employees');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      default: return 'default';
    }
  };

  const getWorkStatusColor = (workStatus) => {
    switch (workStatus) {
      case 'active': return 'blue';
      case 'on_leave': return 'orange';
      case 'inactive': return 'red';
      default: return 'default';
    }
  };

  // ✅ NEW: Columns for scan history table
  const scanHistoryColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, record, index) => index + 1,
    },
    {
      title: 'Mã vé',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId) => (
        <Text code style={{ fontSize: '12px' }}>
          {orderId}
        </Text>
      ),
    },
    {
      title: 'Phim',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      render: (title) => (
        <Text ellipsis style={{ maxWidth: 150 }}>
          {title || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
key: 'customerName',
      render: (name) => (
        <Text ellipsis style={{ maxWidth: 120 }}>
          {name || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Ghế',
      dataIndex: 'seatNumber',
      key: 'seatNumber',
      render: (seats) => (
        <Tag color="blue" style={{ fontSize: '11px' }}>
          {seats || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Suất chiếu',
      dataIndex: 'showTime',
      key: 'showTime',
      render: (showTime) => (
        <Text style={{ fontSize: '12px' }}>
          {showTime && showTime !== 'N/A' ? 
            moment(showTime).format('DD/MM HH:mm') : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Thời gian quét',
      dataIndex: 'scanTime',
      key: 'scanTime',
      render: (scanTime) => (
        <div>
          <div>{moment(scanTime).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {moment(scanTime).format('HH:mm:ss')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'used' ? 'green' : 'orange'}
          icon={status === 'used' ? <CheckCircleOutlined /> : null}
        >
          {status === 'used' ? 'Đã sử dụng' : 'Chưa xác định'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Empty description="Không tìm thấy thông tin nhân viên" />
        <Button type="primary" onClick={handleBack}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Chi tiết nhân viên
          </Title>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Basic Info */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={120}
                src={employee.image}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
              >
                {employee.name?.charAt(0)}
              </Avatar>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {employee.name}
              </Title>
              <Text type="secondary">
                ID: {employee._id?.slice(-8)}
              </Text>
{employee.employee?.employee_id && (
                <div style={{ marginTop: 4 }}>
                  <Text strong>
                    Mã NV: {employee.employee.employee_id}
                  </Text>
                </div>
              )}
            </div>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text>{employee.email}</Text>
              </div>
              <div>
                <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                <Text>{employee.number_phone}</Text>
              </div>
              <div>
                <CalendarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                <Text>
                  Ngày sinh: {employee.date_of_birth ? moment(employee.date_of_birth).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                </Text>
              </div>
              <div>
                <IdcardOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                <Text>
                  Giới tính: {
                    employee.gender === 'male' ? 'Nam' :
                    employee.gender === 'female' ? 'Nữ' :
                    employee.gender === 'other' ? 'Khác' : 'Chưa cập nhật'
                  }
                </Text>
              </div>
            </Space>

            <Divider />

            {/* ✅ NEW: Scan Statistics */}
            {employee.role === 'employee' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ display: 'flex', alignItems: 'center' }}>
                    <ScanOutlined style={{ marginRight: 8 }} />
                    Thống kê quét vé
                  </Text>
                </div>
                <Row gutter={8}>
                  <Col span={12}>
                    <Statistic
                      title="Tổng quét"
                      value={scanStats.totalScanned}
                      valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Hôm nay"
                      value={scanStats.todayScanned}
                      valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                    />
                  </Col>
                </Row>
                <Divider />
              </>
            )}

            <div style={{ textAlign: 'center' }}>
              <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                size="large"
              >
                Quay lại danh sách
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right Column - Detailed Info */}
        <Col xs={24} lg={16}>
{/* Account Status */}
          <Card title="Trạng thái tài khoản" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong>Trạng thái tài khoản</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color={getStatusColor(employee.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                      {employee.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong>Trạng thái làm việc</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag 
                      color={getWorkStatusColor(employee.employee?.work_status)} 
                      style={{ fontSize: 14, padding: '4px 12px' }}
                    >
                      {employee.employee?.work_status === 'active' ? 'Đang làm việc' :
                       employee.employee?.work_status === 'on_leave' ? 'Nghỉ phép' :
                       employee.employee?.work_status === 'inactive' ? 'Tạm nghỉ' :
                       'Chưa cập nhật'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Employee Details */}
          <Card title="Thông tin công việc" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Vị trí">
                <Tag color="blue">Nhân viên</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày vào làm">
                {employee.employee?.hire_date ? 
                  moment(employee.employee.hire_date).format('DD/MM/YYYY') : 
                  'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo tài khoản">
                {moment(employee.createdAt).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Email xác thực">
                <Tag color={employee.email_verify ? 'green' : 'red'}>
                  {employee.email_verify ? 'Đã xác thực' : 'Chưa xác thực'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò hệ thống">
                <Tag color="orange">
                  {employee.role === 'admin' ? 'Quản trị viên' : 
                   employee.role === 'employee' ? 'Nhân viên' : 'Khách hàng'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* ✅ NEW: Activity History with Tabs */}
          <Card 
            title={
              <Space>
                <HistoryOutlined />
                <span>Lịch sử hoạt động</span>
</Space>
            }
          >
            {employee.role === 'employee' ? (
              <Tabs defaultActiveKey="scan_history">
                <TabPane 
                  tab={
                    <span>
                      <ScanOutlined />
                      Lịch sử quét vé ({scanHistory.length})
                    </span>
                  } 
                  key="scan_history"
                >
                  <Spin spinning={scanLoading}>
                    {scanHistory.length > 0 ? (
                      <>
                        {/* Statistics Cards */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col xs={12} sm={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Tổng quét"
                                value={scanStats.totalScanned}
                                prefix={<ScanOutlined />}
                              />
                            </Card>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Hôm nay"
                                value={scanStats.todayScanned}
                                prefix={<TrophyOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Tháng này"
                                value={scanStats.thisMonthScanned}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                              <Statistic
                                title="Hợp lệ"
                                value={scanStats.validScanned}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                              />
                            </Card>
                          </Col>
                        </Row>

                        {/* Scan History Table */}
                        <Table
                          columns={scanHistoryColumns}
                          dataSource={scanHistory}
                          rowKey="_id"
                          pagination={{
pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) => 
                              `${range[0]}-${range[1]} của ${total} vé đã quét`
                          }}
                          size="small"
                          scroll={{ x: 800 }}
                        />
                      </>
                    ) : (
                      <Empty 
                        description="Chưa có lịch sử quét vé nào"
                        style={{ margin: '40px 0' }}
                      />
                    )}
                  </Spin>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <HistoryOutlined />
                      Hoạt động khác
                    </span>
                  } 
                  key="other_activities"
                >
                  <Empty 
                    description="Chưa có dữ liệu hoạt động khác"
                    style={{ margin: '40px 0' }}
                  />
                </TabPane>
              </Tabs>
            ) : (
              <Empty 
                description="Không có lịch sử hoạt động cho vai trò này"
                style={{ margin: '40px 0' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDetail;