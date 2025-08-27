import React, { useState, useEffect } from "react";
import {
  DatePicker,
  Select,
  Button,
  Table,
  Row,
  Col,
  Typography,
  Card,
  Statistic,
  Space,
  message,
  Spin
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  DollarOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  BankOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import apiService from "../config/api";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const RevenueStatistics = () => {
  const [selectedMovie, setSelectedMovie] = useState("all");
  const [selectedCinema, setSelectedCinema] = useState("all");
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    totalMovies: 0,
    totalCinemas: 0
  });

  // Data states
  const [movieData, setMovieData] = useState([]);
  const [cinemaData, setCinemaData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto refresh data when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchRevenueData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedMovie, selectedCinema]);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      
      // Lấy danh sách phim từ dữ liệu vé
      try {
        const ticketsResponse = await apiService.getAllTickets({
          limit: 1000
        });
        
        if (ticketsResponse.success && ticketsResponse.data) {
          const tickets = ticketsResponse.data;
          
          // Tạo danh sách phim từ dữ liệu vé
          const uniqueMovies = [];
          const movieIds = new Set();
          
          // Tạo danh sách rạp từ dữ liệu vé
          const uniqueCinemas = [];
          const cinemaIds = new Set();
          
          tickets.forEach(ticket => {
            // Xử lý phim
            if (ticket.movie) {
              const movieId = ticket.movie._id || ticket.movie;
              const movieName = ticket.movie.name || 
                              ticket.movie.title || 
                              ticket.movieName || 
                              ticket.movieTitle;
              
              if (movieId && movieName && !movieIds.has(movieId)) {
                movieIds.add(movieId);
                uniqueMovies.push({
                  _id: movieId,
                  name: movieName,
                  title: movieName
                });
              }
            }
            
            // Xử lý rạp
            if (ticket.cinema) {
              const cinemaId = ticket.cinema._id || ticket.cinema;
              const cinemaName = ticket.cinema.name || 
                               ticket.cinemaName || 
                               'Rạp không xác định';
              
              if (cinemaId && cinemaName && !cinemaIds.has(cinemaId)) {
                cinemaIds.add(cinemaId);
                uniqueCinemas.push({
                  _id: cinemaId,
                  name: cinemaName
                });
              }
            }
          });
          
          setMovies(uniqueMovies);
          setCinemas(uniqueCinemas);
          
          setStats(prev => ({
            ...prev,
            totalMovies: uniqueMovies.length,
            totalCinemas: uniqueCinemas.length
          }));
        }
      } catch (error) {
        console.warn('Error fetching tickets for movie list:', error);
        setMovies([]);
        setCinemas([]);
      }

      // Fetch initial revenue data
      await fetchRevenueData();
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      message.warning('Một số dữ liệu có thể không hiển thị được do lỗi kết nối');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Sử dụng API có sẵn từ màn hình danh sách vé
      const ticketsResponse = await apiService.getAllTickets({
        limit: 1000 // Lấy nhiều vé để thống kê
      });
      
      if (ticketsResponse.success && ticketsResponse.data && ticketsResponse.data.length > 0) {
        const tickets = ticketsResponse.data;
        
        // Lọc theo trạng thái đã hoàn thành/sử dụng và theo khoảng thời gian được chọn
        const startDate = dateRange[0];
        const endDate = dateRange[1];
        
        const filteredTickets = tickets.filter(ticket => {
          // Lọc theo trạng thái - Bao gồm cả vé đã sử dụng (used)
          const statusMatch = ticket.status === 'completed' || 
                             ticket.status === 'confirmed' || 
                             ticket.status === 'active' ||
                             ticket.status === 'used' || // Trạng thái đã sử dụng (sau khi quét mã)
                             ticket.status === 'scanned' || // Có thể là trạng thái đã quét
                             ticket.status === 'checked_in'; // Có thể là trạng thái đã check-in
          
          // Lọc theo thời gian
          const ticketDate = ticket.createdAt || 
                            ticket.bookingTime || 
                            ticket.date ||
                            ticket.confirmedAt;
          
          let dateMatch = true;
          if (ticketDate) {
            const tDate = dayjs(ticketDate);
            dateMatch = tDate.isAfter(startDate.subtract(1, 'day')) && 
                       tDate.isBefore(endDate.add(1, 'day'));
          }
          
          // Lọc theo phim (nếu có chọn phim cụ thể)
          let movieMatch = true;
          if (selectedMovie !== 'all') {
            const movieId = ticket.movie?._id || ticket.movie;
            movieMatch = movieId === selectedMovie;
          }
          
          // Lọc theo rạp (nếu có chọn rạp cụ thể)
          let cinemaMatch = true;
          if (selectedCinema !== 'all') {
            const cinemaId = ticket.cinema?._id || ticket.cinema;
            cinemaMatch = cinemaId === selectedCinema;
          }
          
          return statusMatch && dateMatch && movieMatch && cinemaMatch;
        });
        
        // Tính toán thống kê
        let totalRevenue = 0;
        const movieStats = {};
        const cinemaStats = {};
        const dailyStats = {};
        
        filteredTickets.forEach(ticket => {
          // Lấy số tiền từ nhiều trường khác nhau (như trong Tickets.js)
          const revenue = ticket.total || 
                         ticket.totalPrice || 
                         ticket.totalAmount ||
                         ticket.price || 
                         ticket.amount || 
                         ticket.seatTotalPrice ||
                         0;
          
          totalRevenue += revenue;
          
          // Thống kê theo phim
          const movieName = ticket.movie?.name || 
                           ticket.movie?.title || 
                           ticket.movieName || 
                           ticket.movieTitle || 
                           'Phim không xác định';
          
          if (!movieStats[movieName]) {
            movieStats[movieName] = { revenue: 0, tickets: 0 };
          }
          movieStats[movieName].revenue += revenue;
          movieStats[movieName].tickets += 1;
          
          // Thống kê theo rạp
          const cinemaName = ticket.cinema?.name || 
                            ticket.cinemaName || 
                            'Rạp không xác định';
          
          if (!cinemaStats[cinemaName]) {
            cinemaStats[cinemaName] = { revenue: 0, tickets: 0 };
          }
          cinemaStats[cinemaName].revenue += revenue;
          cinemaStats[cinemaName].tickets += 1;
          
          // Thống kê theo ngày
          const ticketDate = ticket.createdAt || 
                            ticket.bookingTime || 
                            ticket.date ||
                            ticket.confirmedAt;
          
          if (ticketDate) {
            const date = dayjs(ticketDate).format('YYYY-MM-DD');
            if (!dailyStats[date]) {
              dailyStats[date] = { revenue: 0, tickets: 0 };
            }
            dailyStats[date].revenue += revenue;
            dailyStats[date].tickets += 1;
          }
        });
        
        // Cập nhật stats tổng quan
        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalTickets: filteredTickets.length,
          totalMovies: Object.keys(movieStats).length,
          totalCinemas: Object.keys(cinemaStats).length
        }));
        
        // Xử lý dữ liệu phim
        const movieDataArray = Object.entries(movieStats)
          .map(([name, stats]) => ({
            key: name,
            movie: name,
            total: stats.revenue,
            tickets: stats.tickets,
            percentage: totalRevenue > 0 ? ((stats.revenue / totalRevenue) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.total - a.total);
        
        setMovieData(movieDataArray);
        
        // Tạo dữ liệu pie chart cho phim
        const pieChartData = movieDataArray.slice(0, 5).map((movie, index) => ({
          name: movie.movie.length > 20 ? movie.movie.substring(0, 20) + '...' : movie.movie,
          value: movie.total,
          color: ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96'][index]
        }));
        setPieData(pieChartData);
        
        // Xử lý dữ liệu rạp
        const cinemaDataArray = Object.entries(cinemaStats)
          .map(([name, stats]) => ({
            key: name,
            cinema: name,
            total: stats.revenue,
            tickets: stats.tickets,
            percentage: totalRevenue > 0 ? ((stats.revenue / totalRevenue) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.total - a.total);
        
        setCinemaData(cinemaDataArray);
        
        // Tạo dữ liệu bar chart cho rạp
        const barChartData = cinemaDataArray.map(cinema => ({
          name: cinema.cinema.length > 15 ? cinema.cinema.substring(0, 15) + '...' : cinema.cinema,
          total: cinema.total,
          tickets: cinema.tickets
        }));
        setChartData(barChartData);
        
        // Xử lý dữ liệu xu hướng theo ngày
        const trendDataArray = Object.entries(dailyStats)
          .map(([date, stats]) => ({
            date: dayjs(date).format('DD/MM'),
            revenue: stats.revenue,
            tickets: stats.tickets
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-7); // Chỉ lấy 7 ngày gần nhất
        
        setTrendData(trendDataArray);
        
        message.success(`Đã tải thống kê từ ${filteredTickets.length} vé (${tickets.length} tổng số vé)`);
        
      } else {
        // Không có dữ liệu vé
        setMovieData([]);
        setCinemaData([]);
        setChartData([]);
        setPieData([]);
        setTrendData([]);
        
        setStats(prev => ({
          ...prev,
          totalRevenue: 0,
          totalTickets: 0
        }));
        
        message.info('Chưa có dữ liệu vé để thống kê');
      }
      
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      message.error('Lỗi khi tải dữ liệu thống kê: ' + error.message);
      
      // Reset data on error
      setMovieData([]);
      setCinemaData([]);
      setChartData([]);
      setPieData([]);
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

  const movieColumns = [
    {
      title: "Phim",
      dataIndex: "movie",
      key: "movie",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tổng Tiền",
      dataIndex: "total",
      key: "total",
      render: (value) => (
        <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </Text>
      ),
    },
    {
      title: "Số Vé",
      dataIndex: "tickets",
      key: "tickets",
      render: (value) => <Text>{value} vé</Text>,
    },
    {
      title: "Tỷ lệ (%)",
      dataIndex: "percentage",
      key: "percentage",
      render: (value) => <Text>{value}%</Text>,
    },
  ];

  const cinemaColumns = [
    {
      title: "Rạp",
      dataIndex: "cinema",
      key: "cinema",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Tổng Tiền",
      dataIndex: "total",
      key: "total",
      render: (value) => (
        <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
          {value.toLocaleString("vi-VN")} VNĐ
        </Text>
      ),
    },
    {
      title: "Số Vé",
      dataIndex: "tickets",
      key: "tickets",
      render: (value) => <Text>{value} vé</Text>,
    },
    {
      title: "Tỷ lệ (%)",
      dataIndex: "percentage",
      key: "percentage",
      render: (value) => <Text>{value}%</Text>,
    },
  ];

  const handleFilter = async () => {
    await fetchRevenueData();
    message.success("Dữ liệu đã được cập nhật");
  };

  const handleRefresh = async () => {
    await fetchRevenueData();
    message.success("Dữ liệu đã được làm mới");
  };

  // Show loading screen during initial load
  if (initialLoading) {
    return (
      <div style={{ 
        padding: 24, 
        background: "#f5f5f5", 
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
        📊 Thống Kê Doanh Thu
      </Title>

      {/* Filter Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Bộ lọc: </Text>
          </Col>
          <Col>
            <Select
              value={selectedMovie}
              onChange={setSelectedMovie}
              style={{ width: 250 }}
              placeholder="Chọn phim"
            >
              <Option value="all">Tất cả phim</Option>
              {movies.map(movie => (
                <Option key={movie._id} value={movie._id}>
                  {movie.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              value={selectedCinema}
              onChange={setSelectedCinema}
              style={{ width: 200 }}
              placeholder="Chọn rạp"
            >
              <Option value="all">Tất cả rạp</Option>
              {cinemas.map(cinema => (
                <Option key={cinema._id} value={cinema._id}>
                  {cinema.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
          <Col>
            <Space>
              <Button type="primary" onClick={handleFilter} loading={loading}>
                Lọc dữ liệu
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              suffix="VNĐ"
              valueStyle={{ color: "#52c41a" }}
              formatter={(value) => value.toLocaleString("vi-VN")}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Số Vé"
              value={stats.totalTickets}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              suffix="vé"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số Phim"
              value={stats.totalMovies}
              prefix={<VideoCameraOutlined style={{ color: "#722ed1" }} />}
              suffix="phim"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số Rạp"
              value={stats.totalCinemas}
              prefix={<BankOutlined style={{ color: "#fa8c16" }} />}
              suffix="rạp"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Doanh thu theo rạp" size="small">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString("vi-VN") + " VNĐ", "Doanh thu"]}
                  />
                  <Bar dataKey="total" fill="#1890ff" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                {loading ? <Spin /> : 'Không có dữ liệu doanh thu theo rạp'}
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Phân bổ doanh thu theo phim" size="small">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString("vi-VN") + " VNĐ"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                {loading ? <Spin /> : 'Không có dữ liệu doanh thu theo phim'}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Trend Chart */}
      <Card title="Xu hướng doanh thu theo ngày" style={{ marginBottom: 24 }}>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString("vi-VN") + " VNĐ", "Doanh thu"]} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#52c41a" 
                strokeWidth={3}
                dot={{ fill: "#52c41a", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: 250, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999'
          }}>
            {loading ? <Spin /> : 'Không có dữ liệu xu hướng doanh thu'}
          </div>
        )}
      </Card>

      {/* Summary */}
      <Card style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={4} style={{ color: "#52c41a", margin: 0 }}>
          💰 Tổng doanh thu: {stats.totalRevenue.toLocaleString("vi-VN")} VNĐ
        </Title>
        <Text type="secondary">
          Từ {dateRange[0]?.format("DD/MM/YYYY")} đến {dateRange[1]?.format("DD/MM/YYYY")} 
          {selectedMovie !== 'all' && (
            <span> - Phim: {movies.find(m => m._id === selectedMovie)?.name || 'Đã chọn'}</span>
          )}
          {selectedCinema !== 'all' && (
            <span> - Rạp: {cinemas.find(c => c._id === selectedCinema)?.name || 'Đã chọn'}</span>
          )}
        </Text>
      </Card>

      {/* Data Tables */}
      <Row gutter={24}>
        <Col span={12}>
          <Card title="📽️ Doanh thu theo phim" size="small">
            <Table
              dataSource={movieData}
              columns={movieColumns}
              pagination={false}
              bordered
              size="small"
              loading={loading}
              locale={{
                emptyText: loading ? 'Đang tải...' : 'Không có dữ liệu doanh thu theo phim'
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="🏢 Doanh thu theo rạp" size="small">
            <Table
              dataSource={cinemaData}
              columns={cinemaColumns}
              pagination={false}
              bordered
              size="small"
              loading={loading}
              locale={{
                emptyText: loading ? 'Đang tải...' : 'Không có dữ liệu doanh thu theo rạp'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueStatistics;