import React, { useState } from 'react';
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
  Divider,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const CreateDiscount = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('Form values:', values);
      
      const discountData = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        type: values.discountType || 'ticket',
        percent: parseInt(values.discountValue) || 0,
        dayStart: values.dateRange[0].format('YYYY-MM-DD'),
        dayEnd: values.dateRange[1].format('YYYY-MM-DD'),
        status: values.status ? 'active' : 'inactive',
        description: values.description?.trim() || '',
      };

      console.log('Sending discount data:', discountData);
      const response = await ApiService.createDiscount(discountData);
      console.log('Create response:', response);
      
      if (response.success) {
        message.success('Tạo khuyến mãi thành công!');
        
        // Reset form
        form.resetFields();
        
        // Navigate back to list
        navigate('/admin/discounts');
      } else {
        console.error('API error response:', response);
        message.error(response.message || 'Lỗi khi tạo khuyến mãi');
      }
    } catch (error) {
      console.error('Create discount error:', error);
      message.error('Lỗi khi tạo khuyến mãi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="!mb-0 flex items-center">
            <PercentageOutlined className="mr-2 text-blue-500" />
            Thêm khuyến mãi mới
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
          initialValues={{
            status: true,
            discountType: 'ticket',
            usageLimit: 100,
          }}
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
                    { max: 100, message: 'Tên khuyến mãi không được quá 100 ký tự' }
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
                    { pattern: /^[A-Z0-9]+$/, message: 'Mã chỉ chứa chữ hoa và số' }
                  ]}
                >
                  <Input placeholder="Ví dụ: WEEKEND50" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Mô tả chi tiết về khuyến mãi..."
                  />
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
                    <Option value="percentage">Phần trăm (%)</Option>
                    <Option value="ticket">Vé xem phim</Option>
                    <Option value="food">Đồ ăn & Nước uống</Option>
                    <Option value="combo">Combo</Option>
                    <Option value="movie">Phim</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="discountValue"
                  label="Giá trị khuyến mãi"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị khuyến mãi' },
                    { type: 'number', min: 1, message: 'Giá trị phải lớn hơn 0' }
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập giá trị"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
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
              </Card>
            </Col>
          </Row>

          {/* Advanced Settings */}
          <Card title="Cài đặt nâng cao" className="mb-6">
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="minOrderAmount"
                  label="Giá trị đơn hàng tối thiểu"
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="maxDiscountAmount"
                  label="Giảm giá tối đa (VND)"
                >
                  <InputNumber
                    placeholder="Không giới hạn"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
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
              </Col>
            </Row>
          </Card>

          {/* Form Actions */}
          <Card>
            <Row gutter={16}>
              <Col>
                <Form.Item name="continueAdding" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col>
                <Text>Tiếp tục thêm khuyến mãi sau khi lưu</Text>
              </Col>
            </Row>

            <Divider />

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
                  Tạo khuyến mãi
                </Button>
              </Space>
            </Form.Item>
          </Card>
        </Form>
      </Card>
    </div>
  );
};

export default CreateDiscount;
