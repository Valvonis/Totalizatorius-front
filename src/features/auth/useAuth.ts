import { useAppSelector } from "../../hooks";

export function useAuth() {
  const { player, league, token, loading } = useAppSelector((state) => state.auth);
  return {
    player,
    league,
    leagueId: league?._id ?? player?.leagueId ?? null,
    token,
    loading,
    isLoggedIn: !!token && !!player,
    isAdmin: player?.isAdmin ?? false,
    isSuperAdmin: player?.isSuperAdmin ?? false,
  };
}
