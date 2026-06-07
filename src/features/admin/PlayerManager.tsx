import { useState, useEffect } from "react";
import api from "../../api/client";
import { slugify } from "../../utils/slug";
import { showToast } from "../../components/ui/Toast";
import FormInput from "../../components/ui/FormInput";
import InlineSaveCancel from "./InlineSaveCancel";
import { Plus, Users, Shield, ShieldOff, KeyRound, Trash2 } from "lucide-react";
import type { Player } from "../../types";

export default function PlayerManager() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerSlug, setNewPlayerSlug] = useState("");
  const [newPlayerPin, setNewPlayerPin] = useState("");
  const [newPlayerAdmin, setNewPlayerAdmin] = useState(false);
  const [editingPin, setEditingPin] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");

  const fetchPlayers = () => {
    api.get<Player[]>("/players").then(({ data }) => setAllPlayers(data));
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName || !newPlayerSlug || !newPlayerPin) return;

    try {
      await api.post("/players", { name: newPlayerName, slug: newPlayerSlug, pin: newPlayerPin, isAdmin: newPlayerAdmin });
      showToast("Žaidėjas sukurtas!", "success");
      setNewPlayerName("");
      setNewPlayerSlug("");
      setNewPlayerPin("");
      setNewPlayerAdmin(false);
      fetchPlayers();
    } catch {
      showToast("Nepavyko sukurti žaidėjo", "error");
    }
  };

  const handleToggleAdmin = async (playerId: string, currentAdmin: boolean) => {
    try {
      await api.patch(`/players/${playerId}`, { isAdmin: !currentAdmin });
      showToast(!currentAdmin ? "Administratorius pridėtas" : "Administratorius pašalintas", "success");
      fetchPlayers();
    } catch {
      showToast("Nepavyko atnaujinti", "error");
    }
  };

  const handleChangePin = async (playerId: string) => {
    if (!newPin || newPin.length < 4) return;
    try {
      await api.patch(`/players/${playerId}`, { pin: newPin });
      showToast("PIN pakeistas!", "success");
      setEditingPin(null);
      setNewPin("");
    } catch {
      showToast("Nepavyko pakeisti PIN", "error");
    }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!window.confirm(`Ar tikrai norite ištrinti žaidėją "${playerName}"?`)) return;
    try {
      await api.delete(`/players/${playerId}`);
      showToast("Žaidėjas ištrintas", "success");
      fetchPlayers();
    } catch {
      showToast("Nepavyko ištrinti žaidėjo", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users size={22} />
        Žaidėjai
      </h2>

      {/* Existing players */}
      {allPlayers.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {allPlayers.map((p) => {
            const pid = p._id || p.id || "";
            return (
              <div key={pid} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{p.name}</span>
                    <span className="text-xs text-gray-400">({p.slug})</span>
                    {p.isAdmin && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <Shield size={10} />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAdmin(pid, p.isAdmin)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      title={p.isAdmin ? "Pašalinti admin teises" : "Suteikti admin teises"}
                    >
                      {p.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                    <button
                      onClick={() => { setEditingPin(pid); setNewPin(""); }}
                      className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                      title="Keisti PIN"
                    >
                      <KeyRound size={14} />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(pid, p.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                      title="Ištrinti žaidėją"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* PIN change inline form */}
                {editingPin === pid && (
                  <div className="flex items-center gap-2">
                    <FormInput
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Naujas PIN (4 skaitmenys)"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      compact
                      className="flex-1 text-center tracking-[8px]"
                    />
                    <InlineSaveCancel
                      onSave={() => handleChangePin(pid)}
                      onCancel={() => { setEditingPin(null); setNewPin(""); }}
                      saveDisabled={newPin.length < 4}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create new player */}
      <form onSubmit={handleCreatePlayer} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-bold text-gray-600">Naujas žaidėjas</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            type="text"
            placeholder="Vardas"
            value={newPlayerName}
            onChange={(e) => {
              setNewPlayerName(e.target.value);
              setNewPlayerSlug(slugify(e.target.value));
            }}
            required
          />
          <FormInput
            type="text"
            placeholder="Slug (pvz. vardas)"
            value={newPlayerSlug}
            onChange={(e) => setNewPlayerSlug(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="PIN (4 skaitmenys)"
            value={newPlayerPin}
            onChange={(e) => setNewPlayerPin(e.target.value)}
            className="text-center tracking-[8px]"
            required
          />
          <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={newPlayerAdmin}
              onChange={(e) => setNewPlayerAdmin(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            Administratorius
          </label>
        </div>
        <button
          type="submit"
          disabled={!newPlayerName || !newPlayerSlug || newPlayerPin.length < 4}
          className="flex items-center justify-center gap-2 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-primary-light)] transition-colors cursor-pointer disabled:opacity-40"
        >
          <Plus size={16} />
          Pridėti žaidėją
        </button>
      </form>
    </div>
  );
}
