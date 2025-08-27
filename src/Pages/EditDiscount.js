import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Typography,
  Space,
  Switch,
  DatePicker,
  InputNumber,
  Select,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PercentageOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import ApiService from '../services/ApiService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const EditDiscount = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [discountData, setDiscountData] = useState(null);
  const [existingDiscounts, setExistingDiscounts] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch all discounts for validation
  const fetchAllDiscounts = async () => {
    try {
      const response = await ApiService.getDiscounts();
      if (response.success) {
        setExistingDiscounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching all discounts:', error);
    }
  };

  // Validate unique name (exclude current discount)
  const validateUniqueName = (_, value) => {
    if (!value) return Promise.resolve();
    
    const trimmedValue = value.trim();
    const isDuplicate = existingDiscounts.some(
      discount => discount._id !== id && discount.name.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (isDuplicate) {
      return Promise.reject(new Error('Tên khuyến mãi đã tồn tại!'));
    }
    
    return Promise.resolve();
  };

  // Validate unique code (exclude current discount)
  const validateUniqueCode = (_, value) => {
    if (!value) return Promise.resolve();
    
    const trimmedValue = value.trim().toUpperCase();
    const isDuplicate = existingDiscounts.some(
      discount => discount._id !== id && discount.code.toUpperCase() === trimmedValue
    );
    
    if (isDuplicate) {
      return Promise.reject(new Error('Mã code đã tồn tại!'));
    }
    
    return Promise.resolve();
  };

  // Fetch discount data
  const fetchDiscountData = async () => {
    setPageLoading(true);
    try {
      const response = await ApiService.getDiscountById(id);
      
      if (response.success) {
        const discount = response.data;
        setDiscountData(discount);
        
        // Set form values
        form.setFieldsValue({
          name: discount.name,
          code: discount.code,
          discountType: discount.type,
          discountValue: discount.percent,
          dateRange: [
            moment(discount.dayStart || discount.startDate),
            moment(discount.dayEnd || discount.endDate)
          ],
          status: discount.status === 'active',
        });
      } else {
        message.error(response.message || 'Lỗi khi tải thông tin khuyến mãi');
        navigate('/admin/discounts');
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin khuyến mãi: ' + error.message);
      console.error('Fetch discount error:', error);
      navigate('/admin/discounts');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDiscountData();
      fetchAllDiscounts();
    }
  }, [id]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.discountType,
        percent: parseInt(values.discountValue),
        dayStart: values.dateRange[0].toISOString(),
        dayEnd: values.dateRange[1].toISOString(),
        status: values.status ? 'active' : 'inactive',
      };

      const response = await ApiService.updateDiscount(id, updateData);
      
      if (response.success) {
        message.success('Cập nhật khuyến mãi thành công!');
        navigate('/admin/discounts');
      } else {
        message.error(response.message || 'Lỗi khi cập nhật khuyến mãi');
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật khuyến mãi: ' + error.message);
      console.error('Update discount error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-6 text-center">
        <Spin 
          size="large" 
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        />
        <div className="mt-4">
          <Text>Đang tải thông tin khuyến mãi...</Text>
        </div>
      </div>
    );
  }

  if (!discountData) {
    return (
      <div className="p-6 text-center">
        <Text type="danger">Không tìm thấy thông tin khuyến mãi</Text>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="!mb-0 flex items-center">
            <PercentageOutlined className="mr-2 text-blue-500" />
            Chỉnh sửa khuyến mãi: {discountData.name}
          </Title>
          <Link to="/admin/discounts">
            <Button icon={<ArrowLeftOutlined />}>
              Quay lại danh sách
            </Button>
          </Link>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} lg={12}>
              <Card title="Thông tin cơ bản" className="mb-4">
                <Form.Item
                  name="name"
                  label="Tên khuyến mãi"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên khuyến mãi' },
                    { min: 3, message: 'Tên khuyến mãi phải có ít nhất 3 ký tự' },
                    { max: 100, message: 'Tên khuyến mãi không được quá 100 ký tự' },
                    { validator: validateUniqueName }
                  ]}
                >
                  <Input placeholder="Ví dụ: Khuyến mãi cuối tuần" />
                </Form.Item>

                <Form.Item
                  name="code"
                  label="Mã khuyến mãi"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã khuyến mãi' },
                    { min: 3, message: 'Mã khuyến mãi phải có ít nhất 3 ký tự' },
                    { max: 20, message: 'Mã khuyến mãi không được quá 20 ký tự' },
                    { pattern: /^[A-Z0-9]+$/, message: 'Mã chỉ chứa chữ hoa và số' },
                    { validator: validateUniqueCode }
                  ]}
                >
                  <Input placeholder="Ví dụ: WEEKEND50" />
                </Form.Item>


              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={12}>
              <Card title="Cài đặt khuyến mãi" className="mb-4">
                <Form.Item
                  name="discountType"
                  label="Loại khuyến mãi"
                  rules={[{ required: true, message: 'Vui lòng chọn loại khuyến mãi' }]}
                >
                  <Select placeholder="Chọn loại khuyến mãi">
                    <Option value="ticket">Vé xem phim</Option>
                    <Option value="food">Đồ ăn & Nước uống</Option>
                    <Option value="combo">Combo</Option>
                    <Option value="movie">Phim</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="discountValue"
                  label="Giá trị khuyến mãi (%)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị khuyến mãi' },
                    { type: 'number', min: 1, max: 100, message: 'Giá trị phải từ 1% đến 100%' }
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập giá trị từ 1-100"
                    style={{ width: '100%' }}
                    min={1}
                    max={100}
                    addonAfter="%"
                  />
                </Form.Item>

                <Form.Item
                  name="dateRange"
                  label="Thời gian áp dụng"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                  />
                </Form.Item>

                <Form.Item
                  name="usageLimit"
                  label="Giới hạn sử dụng"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giới hạn sử dụng' },
                    { type: 'number', min: 1, message: 'Giới hạn phải lớn hơn 0' }
                  ]}
                >
                  <InputNumber
                    placeholder="Số lần sử dụng tối đa"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Trạng thái"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Kích hoạt"
                    unCheckedChildren="Tạm dừng"
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Form Actions */}
          <Card>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Link to="/admin/discounts">
                  <Button>
                    Hủy
                  </Button>
                </Link>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Cập nhật khuyến mãi
                </Button>
              </Space>
            </Form.Item>
          </Card>
        </Form>
      </Card>
    </div>
  );
};

export default EditDiscount;
