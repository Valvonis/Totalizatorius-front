import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMatches } from "../features/matches/matchesSlice";
import { fetchActiveTournament, fetchAllTournaments } from "../features/tournaments/tournamentSlice";
import { fetchQuestions } from "../features/questions/questionsSlice";
import { fetchLeagues, setManageLeague } from "../features/leagues/leagueSlice";
import { useAuth } from "../features/auth/useAuth";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import TournamentManager from "../features/admin/TournamentManager";
import LeagueManager from "../features/admin/LeagueManager";
import MatchCreateForm from "../features/admin/MatchCreateForm";
import QuestionManager from "../features/admin/QuestionManager";
import MatchAdminList from "../features/admin/MatchAdminList";
import PlayerManager from "../features/admin/PlayerManager";
import { ListChecks, HelpCircle, Users, Boxes, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TabId = "matches" | "questions" | "players" | "leagues" | "tournament";

// Ordered by how often the admin reaches for them (entering results is the daily task).
// `superOnly` tabs are hidden from normal league admins. Icons mirror each manager's header.
const TABS: { id: TabId; label: string; icon: LucideIcon; superOnly?: boolean }[] = [
  { id: "matches", label: "Varžybos", icon: ListChecks },
  { id: "questions", label: "Klausimai", icon: HelpCircle },
  { id: "players", label: "Žaidėjai", icon: Users },
  { id: "leagues", label: "Grupės", icon: Boxes, superOnly: true },
  { id: "tournament", label: "Turnyras", icon: Trophy },
];

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { isAdmin, isSuperAdmin, leagueId } = useAuth();
  const tournament = useAppSelector((s) => s.tournament.active);
  const leagues = useAppSelector((s) => s.leagues.all);
  const manageLeagueId = useAppSelector((s) => s.leagues.manageLeagueId);

  // Which league's questions/players the admin is editing (defaults to own league).
  const activeLeagueId = manageLeagueId || leagueId || null;

  const [tab, setTabState] = useState<TabId>(() => (localStorage.getItem("admin-tab") as TabId) || "matches");
  const setTab = (t: TabId) => {
    setTabState(t);
    localStorage.setItem("admin-tab", t);
  };

  useEffect(() => {
    dispatch(fetchActiveTournament());
    dispatch(fetchAllTournaments());
    if (isSuperAdmin) dispatch(fetchLeagues());
  }, [dispatch, isSuperAdmin]);

  // Default the managed league to the admin's own league once known.
  useEffect(() => {
    if (!manageLeagueId && leagueId) dispatch(setManageLeague(leagueId));
  }, [dispatch, manageLeagueId, leagueId]);

  useEffect(() => {
    if (tournament) {
      dispatch(fetchMatches({ tournamentId: tournament._id }));
      dispatch(fetchQuestions({ tournamentId: tournament._id, leagueId: activeLeagueId || undefined }));
    }
  }, [dispatch, tournament, activeLeagueId]);

  if (!isAdmin) return <Navigate to="/" />;

  // Hide super-admin-only tabs, and fall back if a stored tab is no longer visible
  // (e.g. a normal admin whose device once held "leagues").
  const visibleTabs = TABS.filter((t) => !t.superOnly || isSuperAdmin);
  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : "matches";

  // The league selector only changes which league's questions/players are edited,
  // so it belongs to those two tabs — not the championship-level (shared) ones.
  const showLeagueSelector =
    (activeTab === "questions" || activeTab === "players") && isSuperAdmin && leagues.length > 0;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Section menu */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-wrap gap-1.5">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                activeTab === id
                  ? "bg-[var(--color-primary)] text-white shadow"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* League context (super-admin, league-scoped tabs only) */}
        {showLeagueSelector && (
          <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
            <label className="text-sm font-bold text-gray-600 shrink-0">Tvarkoma grupė:</label>
            <select
              value={activeLeagueId ?? ""}
              onChange={(e) => dispatch(setManageLeague(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {leagues.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.memberCount ?? 0})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Active section */}
        {activeTab === "matches" && (
          <div className="flex flex-col gap-6">
            <MatchCreateForm />
            <MatchAdminList />
          </div>
        )}
        {activeTab === "questions" && <QuestionManager leagueId={activeLeagueId} />}
        {activeTab === "players" && <PlayerManager leagueId={activeLeagueId} />}
        {activeTab === "leagues" && isSuperAdmin && <LeagueManager />}
        {activeTab === "tournament" && <TournamentManager />}
      </div>
    </Layout>
  );
}
