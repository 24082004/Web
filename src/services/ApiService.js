// src/services/ApiService.js
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://my-backend-api-movie.onrender.com/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    let headers = {
      ...options.headers,
    };

    // Nếu body KHÔNG phải FormData => set Content-Type JSON
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      if (options.body && typeof options.body !== "string") {
        options.body = JSON.stringify(options.body);
      }
    }

    // Add auth token if available
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        throw new Error('Email hoặc mật khẩu không đúng, vui lòng thử lại.');
      } else if (response.status === 403) {
        throw new Error('Bạn không có quyền truy cập.');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy tài nguyên.');
      } else {
        throw new Error(`Lỗi máy chủ: ${response.status} - ${errorText}`);
      }
    }


      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  // ================= Auth methods =================
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: credentials,
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: userData,
    });
  }

  async verifyEmail(otpData) {
    return this.request("/auth/verify-email", {
      method: "POST",
      body: otpData,
    });
  }

  async resendOTP(email) {
    return this.request("/auth/resend-otp", {
      method: "POST",
      body: { email },
    });
  }

  async getMe() {
    return this.request("/auth/me");
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async forgotPassword(email) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  }

  async resetPassword(resetData) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: resetData,
    });
  }

  // ================= Admin methods =================
  async getUsers() {
    return this.request("/admin/users");
  }

  async getUserById(id) {
    return this.request(`/admin/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: userData,
    });
  }

  async deleteUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  // ================= Director methods =================
  async getDirectors() {
    return this.request("/directors");
  }

  async getDirectorById(id) {
    return this.request(`/directors/${id}`);
  }

  async createDirector(directorData) {
    return this.request("/directors", {
      method: "POST",
      body: directorData,
    });
  }

  async updateDirector(id, directorData) {
    return this.request(`/directors/${id}`, {
      method: "PUT",
      body: directorData,
    });
  }

  async deleteDirector(id) {
    return this.request(`/directors/${id}`, {
      method: "DELETE",
    });
  }

  // ================= Movie methods =================
  async getMovies() {
    return this.request("/movies");
  }

  async getMovieById(id) {
    return this.request(`/movies/${id}`);
  }

  // createMovie giờ có thể nhận FormData
  async createMovie(movieData) {
    return this.request("/movies", {
      method: "POST",
      body: movieData,
    });
  }

  async updateMovie(id, movieData) {
    return this.request(`/movies/${id}`, {
      method: "PUT",
      body: movieData,
    });
  }

  async deleteMovie(id) {
    return this.request(`/movies/${id}`, {
      method: "DELETE",
    });
  }

  // ================= Actor methods =================
  async getActors() {
    return this.request("/actors");
  }

  async getActorById(id) {
    return this.request(`/actors/${id}`);
  }

  async createActor(actorData) {
    return this.request("/actors", {
      method: "POST",
      body: actorData,
    });
  }

  async updateActor(id, actorData) {
    return this.request(`/actors/${id}`, {
      method: "PUT",
      body: actorData,
    });
  }

  async deleteActor(id) {
    return this.request(`/actors/${id}`, {
      method: "DELETE",
    });
  }

  async uploadActorImage(id, imageData) {
    return this.request(`/actors/${id}/image`, {
      method: "PUT",
      body: imageData,
    });
  }

  // ================= Food methods =================
  async getFoods() {
    return this.request("/foods");
  }

  async getFoodById(id) {
    return this.request(`/foods/${id}`);
  }

  async createFood(foodData) {
    return this.request("/foods", {
      method: "POST",
      body: foodData,
    });
  }

  async updateFood(id, foodData) {
    return this.request(`/foods/${id}`, {
      method: "PUT",
      body: foodData,
    });
  }

  async deleteFood(id) {
    return this.request(`/foods/${id}`, {
      method: "DELETE",
    });
  }

  async uploadFoodImage(id, imageData) {
    return this.request(`/foods/${id}/image`, {
      method: "PUT",
      body: imageData,
    });
  }

  // ================= Cinema methods =================
  async getCinemas() {
    return this.request("/cinemas");
  }

  async getCinemaById(id) {
    return this.request(`/cinemas/${id}`);
  }

  async createCinema(cinemaData) {
    return this.request("/cinemas", {
      method: "POST",
      body: cinemaData,
    });
  }

  async updateCinema(id, cinemaData) {
    return this.request(`/cinemas/${id}`, {
      method: "PUT",
      body: cinemaData,
    });
  }

  async deleteCinema(id) {
    return this.request(`/cinemas/${id}`, {
      method: "DELETE",
    });
  }

  // ================= Discount methods =================
  async getDiscounts() {
    return this.request("/discounts/admin/all");
  }

  async getDiscountById(id) {
    return this.request(`/discounts/${id}`);
  }

  async verifyDiscount(code) {
    return this.request(`/discounts/verify/${code}`);
  }

  async createDiscount(discountData) {
    return this.request("/discounts", {
      method: "POST",
      body: discountData,
    });
  }

  async updateDiscount(id, discountData) {
    return this.request(`/discounts/${id}`, {
      method: "PUT",
      body: discountData,
    });
  }

  async deleteDiscount(id) {
    return this.request(`/discounts/${id}`, {
      method: "DELETE",
    });
  }

  async verifyDiscountByCode(code) {
    try {
      console.log('Verifying discount code:', code);
      const response = await this.request(`/discounts/verify/${code}`);
      console.log('Verify discount response:', response);
      return response;
    } catch (error) {
      console.error('Error verifying discount code:', error);
      throw error;
    }
  }

  // ================= Room methods =================
  async getRooms(cinemaId = null) {
    let endpoint = "/rooms";
    if (cinemaId) {
      endpoint = `/rooms/cinema/${cinemaId}`;
    }
    return this.request(endpoint);
  }

  async getRoomById(id) {
    return this.request(`/rooms/${id}`);
  }

  async createRoom(roomData) {
    return this.request("/rooms", {
      method: "POST",
      body: roomData,
    });
  }

  async updateRoom(id, roomData) {
    return this.request(`/rooms/${id}`, {
      method: "PUT",
      body: roomData,
    });
  }

  async deleteRoom(id) {
    return this.request(`/rooms/${id}`, {
      method: "DELETE",
    });
  }

  // ================= Seat methods =================
  async getSeats() {
    return this.request("/seats");
  }

  async getSeatById(id) {
    return this.request(`/seats/${id}`);
  }

  async getSeatsByRoom(roomId) {
    return this.request(`/seats/room/${roomId}`);
  }

  async createSeat(seatData) {
    return this.request("/seats", {
      method: "POST",
      body: seatData,
    });
  }

  async createBulkSeats(seatsData) {
    return this.request("/seats/bulk", {
      method: "POST",
      body: { seats: seatsData },
    });
  }

  async autoGenerateSeats(roomId, configData) {
    return this.request(`/seats/auto-generate/${roomId}`, {
      method: "POST",
      body: configData,
    });
  }

  async updateSeat(id, seatData) {
    return this.request(`/seats/${id}`, {
      method: "PUT",
      body: seatData,
    });
  }

  async deleteSeat(id) {
    return this.request(`/seats/${id}`, {
      method: "DELETE",
    });
  }

  async deleteAllSeatsInRoom(roomId) {
    return this.request(`/seats/room/${roomId}`, {
      method: "DELETE",
    });
  }

  // ================= Utility =================
  getBaseURL() {
    return this.baseURL;
  }

  setBaseURL(url) {
    this.baseURL = url;
  }
}

const apiService = new ApiService();
export default apiService;
