import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch } from "./hooks";
import { fetchMe } from "./features/auth/authSlice";
import { useAuth } from "./features/auth/useAuth";
import LoginPage from "./features/auth/LoginPage";
import JoinPage from "./features/auth/JoinPage";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import PlayerHistoryPage from "./pages/PlayerHistoryPage";
import AdminPage from "./pages/AdminPage";
import ToastContainer from "./components/ui/Toast";
import ConfirmDialog from "./components/ui/ConfirmDialog";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  const dispatch = useAppDispatch();

  // On boot, re-derive {player, league} from the server so stale localStorage
  // self-heals (a 401 is handled by the axios interceptor → redirect to /login).
  useEffect(() => {
    if (localStorage.getItem("token")) dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <ConfirmDialog />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join/:leagueSlug" element={<JoinPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/:slug"
          element={
            <ProtectedRoute>
              <PlayerHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
