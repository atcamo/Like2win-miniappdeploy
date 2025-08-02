"use client";

import { useState } from "react";
import { FarcasterAuthButton } from "./components/AuthButton";

interface CastEmbed {
  url?: string;
  cast_id?: {
    fid: number;
    hash: string;
  };
}

interface Cast {
  hash: string;
  text: string;
  timestamp: string;
  reactions_count: number;
  recasts_count: number;
  replies_count: number;
  embeds: CastEmbed[];
  parent_hash?: string;
}

interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  bio?: string;
  casts?: Cast[];
}

export default function FarcasterPage() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [castText, setCastText] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchUserProfile = async (searchUsername: string) => {
    if (!searchUsername.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Using fetch API to call our API route
      const response = await fetch(
        `/api/farcaster/user?username=${encodeURIComponent(searchUsername)}`,
      );

      if (!response.ok) {
        throw new Error("Usuario no encontrado");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el perfil",
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUserProfile(username);
  };

  const handleCompose = () => {
    if (user) {
      setCastText(`@${user.username} `);
      setShowCompose(true);
    }
  };

  const handlePublishCast = async () => {
    if (!castText.trim()) return;

    setPosting(true);
    setError(null);

    try {
      // Note: This requires the user to have a signer UUID from Neynar
      // In a real app, you'd get this from user authentication
      const signerUuid = localStorage.getItem('farcaster_signer_uuid');
      
      if (!signerUuid) {
        throw new Error('Necesitas autenticarte con Farcaster primero');
      }

      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: castText,
          signerUuid,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al publicar el cast');
      }

      // Success - clear form and close composer
      setCastText('');
      setShowCompose(false);
      
      // Optionally reload user casts to show the new one
      if (user) {
        fetchUserProfile(user.username);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-background)] text-[var(--app-foreground)] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-[var(--app-accent)]">
              Explorador de Perfiles Farcaster
            </h1>
            <FarcasterAuthButton />
          </div>
          <p className="text-[var(--app-foreground-muted)]">
            Busca y visualiza perfiles de usuarios de Farcaster
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              id="username-search"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa el username (ej: dwr, vitalik.eth)"
              className="flex-1 px-4 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-6 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Profile Display */}
        {user && (
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <img
                  src={user.pfp_url}
                  alt={`${user.display_name} profile picture`}
                  className="w-24 h-24 rounded-full border-2 border-[var(--app-accent)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/icon.png"; // Fallback to app icon
                  }}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-[var(--app-foreground)] mb-1">
                    {user.display_name}
                  </h2>
                  <p className="text-[var(--app-accent)] text-lg">
                    @{user.username}
                  </p>
                  <p className="text-sm text-[var(--app-foreground-muted)] mt-1">
                    FID: {user.fid}
                  </p>
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="mb-4">
                    <p className="text-[var(--app-foreground)] leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--app-accent)]">
                      {user.following_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--app-foreground-muted)]">
                      Siguiendo
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--app-accent)]">
                      {user.follower_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--app-foreground-muted)]">
                      Seguidores
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCompose}
                className="px-6 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                📝 Etiquetar a @{user.username}
              </button>
            </div>
          </div>
        )}

        {/* Compose Cast Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
                Crear Cast
              </h3>
              
              <textarea
                id="cast-text-area"
                name="castText"
                value={castText}
                onChange={(e) => setCastText(e.target.value)}
                placeholder="¿Qué está pasando?"
                className="w-full h-32 px-4 py-3 bg-[var(--app-background)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] resize-none"
                autoFocus
                maxLength={320}
              />
              
              <div className="text-right text-sm text-[var(--app-foreground-muted)] mb-4">
                {castText.length}/320
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 text-[var(--app-foreground)] hover:opacity-70"
                  disabled={posting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePublishCast}
                  className="px-6 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={posting || !castText.trim()}
                >
                  {posting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Casts */}
        {user && user.casts && user.casts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
              Últimos Casts
            </h3>
            <div className="space-y-4">
              {user.casts.map((cast) => (
                <div
                  key={cast.hash}
                  className="bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg p-4"
                >
                  <p className="text-[var(--app-foreground)] mb-3 whitespace-pre-wrap">
                    {cast.text}
                  </p>

                  {/* Cast Embeds */}
                  {cast.embeds && cast.embeds.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {cast.embeds.map((embed, idx) => {
                        if (embed.url) {
                          return (
                            <a
                              key={idx}
                              href={embed.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--app-accent)] hover:underline block truncate"
                            >
                              🔗 {embed.url}
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* Cast Interactions */}
                  <div className="flex items-center gap-4 text-sm text-[var(--app-foreground-muted)]">
                    <span className="flex items-center gap-1">
                      ❤️ {cast.reactions_count}
                    </span>
                    <span className="flex items-center gap-1">
                      🔄 {cast.recasts_count}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {cast.replies_count}
                    </span>
                    <span className="ml-auto">
                      {new Date(cast.timestamp).toLocaleString("es-MX", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!user && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[var(--app-foreground)] mb-2">
              Busca un perfil de Farcaster
            </h3>
            <p className="text-[var(--app-foreground-muted)]">
              Ingresa un username para ver la información del perfil
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
