import { useAppSelector } from "../../hooks";

export function useAuth() {
  const { player, token, loading } = useAppSelector((state) => state.auth);
  return {
    player,
    token,
    loading,
    isLoggedIn: !!token && !!player,
    isAdmin: player?.isAdmin ?? false,
  };
}
