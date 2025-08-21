import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import AdminLogin from "./Pages/AdminLogin";
import Users from "./Pages/Users";
import EmployeeList from "./Pages/EmployeeList";
import EmployeeDetail from "./Pages/EmployeeDetail";
import MainLayout from "./Components/MainLayout";
import MovieList from "./Pages/MovieList";
import AddMovie from "./Pages/AddMovie";
import DirectorList from "./Pages/DirectorList";
import RevenueStatistics from "./Pages/RevenueStatistics";
import AuthService from "./services/authService";
import CreateDirector from "./Pages/CreateDirector";
import CreateEmployee from "./Pages/CreateEmployee";
import SeatList from "./Pages/SeatList";
import EditMovie from "./Pages/EditMovie";
import GenreList from "./Pages/GenreList";
import CreateGenre from "./Pages/CreateGenre";
import ActorList from "./Pages/ActorList";
import CreateActor from "./Pages/CreateActor";
import CinemaList from "./Pages/CinemaList";
import RoomList from "./Pages/RoomList";
import Tickets from "./Pages/Tickets";
import DiscountList from "./Pages/DiscountList";
import CreateDiscount from "./Pages/CreateDiscount";
import EditDiscount from "./Pages/EditDiscount";
import FoodList from "./Pages/FoodList";
import ShowtimeList from "./Pages/ShowtimeList";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAdminAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Public Route Component (for login)
const PublicRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAdminAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Login Route - Public */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      {/* Default route - Redirect to login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RevenueStatistics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute>
            <RevenueStatistics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Movie Management Routes */}
      <Route
        path="/admin/movie/list"
        element={
          <ProtectedRoute>
            <MovieList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/movie/edit/:id"
        element={
          <ProtectedRoute>
            <EditMovie />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/addmovie"
        element={
          <ProtectedRoute>
            <AddMovie />
          </ProtectedRoute>
        }
      />

      {/* Directors Routes */}
      <Route
        path="/admin/directors"
        element={
          <ProtectedRoute>
            <DirectorList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/directors/create"
        element={
          <ProtectedRoute>
            <CreateDirector />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/genres/create"
        element={
          <ProtectedRoute>
            <CreateGenre />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/genres"
        element={
          <ProtectedRoute>
            <GenreList />
          </ProtectedRoute>
        }
      />

      {/* Actor Routes */}
      <Route
        path="/admin/actors"
        element={
          <ProtectedRoute>
            <ActorList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/actors/create"
        element={
          <ProtectedRoute>
            <CreateActor />
          </ProtectedRoute>
        }
      />

      {/* Discount Routes */}
      <Route
        path="/admin/discounts"
        element={
          <ProtectedRoute>
            <DiscountList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/discount/add"
        element={
          <ProtectedRoute>
            <CreateDiscount />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/discount/edit/:id"
        element={
          <ProtectedRoute>
            <EditDiscount />
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute>
            <EmployeeList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/employees/:id"
        element={
          <ProtectedRoute>
            <EmployeeDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/employees/create"
        element={
          <ProtectedRoute>
            <CreateEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/foods"
        element={
          <ProtectedRoute>
            <FoodList />
          </ProtectedRoute>
        }
      />

      {/* Other Routes */}
      <Route
        path="/admin/cinemas"
        element={
          <ProtectedRoute>
            <CinemaList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute>
            <RoomList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/seats"
        element={
          <ProtectedRoute>
            <SeatList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/showtimes"
        element={
          <ProtectedRoute>
            <ShowtimeList />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
