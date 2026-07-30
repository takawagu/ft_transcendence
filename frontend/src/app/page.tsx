'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string;
  bio?: string;
  profileImage?: string;
}

interface FriendshipRequest {
  id: number;
  user: User;
}

const AVATAR_PRESETS = [
  '🦊', '🐱', '🐼', '🐯', '🐸', '🐨', '🐙', '👾', '🚀', '🔮'
];

export default function HomePage() {
  const router = useRouter();

  // Auth states
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Title/Form values
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(AVATAR_PRESETS[0]);

  // Home states
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendshipRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendshipRequest[]>([]);
  const [friendQuery, setFriendQuery] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState('');
  const [activeFriendTab, setActiveFriendTab] = useState<'list' | 'requests'>('list');
  const [roomCreateRounds, setRoomCreateRounds] = useState(3);

  // Options / Profile edit modal states
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Hydration state check
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('ft_token');
    const storedUser = localStorage.getItem('ft_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch Friends and Requests
  const fetchFriendsData = async () => {
    if (!token) return;
    try {
      const friendsList = await apiCall('/api/friends');
      setFriends(friendsList);

      const reqs = await apiCall('/api/friends/requests');
      setIncomingRequests(reqs.incoming || []);
      setOutgoingRequests(reqs.outgoing || []);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFriendsData();
    }
  }, [token]);

  // API helper
  const apiCall = async (endpoint: string, method = 'GET', body?: any) => {
    const activeToken = token || localStorage.getItem('ft_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    const res = await fetch(endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('ft_token');
        localStorage.removeItem('ft_user');
        sessionStorage.removeItem('ito_player_name');
        setToken(null);
        setUser(null);
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'エラーが発生しました');
    }
    return res.json();
  };

  // Auth handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      if (isLoginTab) {
        // Login
        const data = await apiCall('/api/auth/login', 'POST', { email, password });
        localStorage.setItem('ft_token', data.token);
        localStorage.setItem('ft_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        // Register
        const data = await apiCall('/api/auth/register', 'POST', {
          email,
          username,
          password,
          bio: '',
          profileImage: '🦊',
        });
        localStorage.setItem('ft_token', data.token);
        localStorage.setItem('ft_user', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (err: any) {
      setAuthError(err.message || '認証に失敗しました。入力内容を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (num: number) => {
    setLoading(true);
    setAuthError('');
    try {
      const email = `dev${num}@example.com`;
      const password = 'password123';
      const data = await apiCall('/api/auth/login', 'POST', { email, password });
      localStorage.setItem('ft_token', data.token);
      localStorage.setItem('ft_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setAuthError(err.message || '開発者ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    sessionStorage.removeItem('ito_player_name');
    setToken(null);
    setUser(null);
    // Clear forms
    setEmail('');
    setUsername('');
    setPassword('');
    setBio('');
    setProfileImage(AVATAR_PRESETS[0]);
  };

  // Room Actions
  const handleCreateRoom = () => {
    if (!user) return;
    sessionStorage.setItem('ito_player_name', user.username);
    sessionStorage.setItem('ito_total_rounds', String(roomCreateRounds));
    router.push('/ito/room/new');
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || roomCodeInput.length < 6) return;
    sessionStorage.setItem('ito_player_name', user.username);
    router.push(`/ito/room/${roomCodeInput.toUpperCase()}`);
  };

  // Friend actions
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFriendError('');
    setFriendSuccess('');
    if (!friendQuery.trim()) return;

    try {
      await apiCall('/api/friends/request', 'POST', { query: friendQuery.trim() });
      setFriendSuccess('フレンド申請を送信しました！');
      setFriendQuery('');
      fetchFriendsData();
    } catch (err: any) {
      setFriendError(err.message || '申請に失敗しました。');
    }
  };

  const handleAcceptFriend = async (friendshipId: number) => {
    try {
      await apiCall('/api/friends/accept', 'POST', { friendshipId });
      fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectFriend = async (friendshipId: number) => {
    try {
      await apiCall('/api/friends/reject', 'POST', { friendshipId });
      fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!confirm('フレンドを削除してもよろしいですか？')) return;
    try {
      await apiCall('/api/friends/remove', 'POST', { friendId });
      fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  // Profile Edit Action
  const openOptions = () => {
    if (!user) return;
    setEditUsername(user.username);
    setEditBio(user.bio || '');
    setEditProfileImage(user.profileImage || '');
    setEditPassword('');
    setEditError('');
    setEditSuccess('');
    setShowOptionsModal(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    try {
      const updated = await apiCall('/api/users/me', 'PUT', {
        username: editUsername,
        bio: editBio,
        profileImage: editProfileImage,
        password: editPassword || undefined,
      });

      setUser(updated);
      localStorage.setItem('ft_user', JSON.stringify(updated));
      setEditSuccess('プロフィールを更新しました！');
      setTimeout(() => setShowOptionsModal(false), 1000);
    } catch (err: any) {
      setEditError(err.message || '更新に失敗しました。');
    }
  };

  // Avatar rendering helper
  const renderAvatar = (avatar: string | undefined, sizeClass = 'w-10 h-10 text-xl') => {
    if (!avatar) {
      return (
        <div className={`${sizeClass} rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold`}>
          ?
        </div>
      );
    }
    if (avatar.length <= 4 && /\p{Emoji}/u.test(avatar)) {
      return (
        <div className={`${sizeClass} rounded-full bg-zinc-850 flex items-center justify-center border border-zinc-700 shadow-inner`}>
          {avatar}
        </div>
      );
    }
    return (
      <img
        src={avatar}
        alt="avatar"
        className={`${sizeClass} rounded-full object-cover border border-zinc-700`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 border-r-2 mx-auto"></div>
          <p className="text-zinc-500 text-sm">読み込み中...</p>
        </div>
      </main>
    );
  }

  // --- TITLE SCREEN (Not logged in) ---
  if (!token || !user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white relative overflow-hidden px-4">
        {/* Decorative background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 z-10">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-md animate-pulse">
              AITO
            </h1>
            <p className="text-zinc-400 text-sm mt-3 tracking-wide">
              数字を言葉で表現し合う、緊迫の協力型カードゲーム
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-zinc-800 mb-6">
            <button
              onClick={() => {
                setIsLoginTab(true);
                setAuthError('');
              }}
              className={`flex-1 pb-3 text-center font-semibold text-sm transition-all duration-200 ${
                isLoginTab
                  ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => {
                setIsLoginTab(false);
                setAuthError('');
              }}
              className={`flex-1 pb-3 text-center font-semibold text-sm transition-all duration-200 ${
                !isLoginTab
                  ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-xs leading-relaxed">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                required
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            {!isLoginTab && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  ユーザー名
                </label>
                <input
                  type="text"
                  required
                  placeholder="ゲームに表示される名前"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                パスワード
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3 font-semibold text-sm text-white disabled:opacity-50 transition-all shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  通信中...
                </>
              ) : isLoginTab ? (
                'ログイン'
              ) : (
                'アカウント登録して開始'
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-800/80"></div>
              <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-wider font-semibold">開発者テスト</span>
              <div className="flex-grow border-t border-zinc-800/80"></div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDevLogin(1)}
                disabled={loading}
                className="flex-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 px-3 py-2.5 font-bold text-xs text-indigo-400 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer"
              >
                Dev1 🚀
              </button>
              <button
                type="button"
                onClick={() => handleDevLogin(2)}
                disabled={loading}
                className="flex-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 px-3 py-2.5 font-bold text-xs text-purple-400 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer"
              >
                Dev2 👾
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // --- HOME SCREEN (Logged in) ---
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1.5 rounded-xl shadow-md">
            <span className="text-xl font-black tracking-widest text-white px-1">AITO</span>
          </div>
          <span className="text-xs text-zinc-500 hidden sm:inline-block">協力型数字表現ゲーム</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-zinc-900/60 pl-3 pr-4 py-1.5 rounded-full border border-zinc-800/80">
            {renderAvatar(user.profileImage, 'w-8 h-8 text-base')}
            <div>
              <div className="text-sm font-semibold text-zinc-100">{user.username}</div>
              {user.bio && <div className="text-[10px] text-zinc-500 truncate max-w-[100px]">{user.bio}</div>}
            </div>
          </div>

          <button
            onClick={openOptions}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 rounded-full border border-zinc-800/80 transition-all"
            title="設定"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900/60 hover:bg-red-950/20 rounded-full border border-zinc-800/80 hover:border-red-900/50 transition-all"
            title="ログアウト"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Column: Room Creation / Join (Span 3) */}
        <div className="md:col-span-3 space-y-6">
          {/* Create Room Card */}
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-600/20 transition-all"></div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-600/10 p-3.5 rounded-xl border border-indigo-500/20 text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1">
                <h2 className="text-xl font-bold text-zinc-100">部屋を新しく作る</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  ホストになってゲームルームを作成し、6桁 of ルームコードを友達に共有して一緒にプレイします。
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/85">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                設定ラウンド数
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoomCreateRounds(r)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      roomCreateRounds === r
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <span className="text-xs text-zinc-500 ml-1">ラウンド</span>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3.5 font-bold text-sm text-white transition-all shadow-md hover:shadow-indigo-500/10 hover:scale-[1.005] active:scale-[0.995] flex items-center justify-center gap-2 cursor-pointer"
            >
              新規ルームを作成
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-purple-600/10 p-3.5 rounded-xl border border-purple-500/20 text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="space-y-1.5 flex-1">
                <h2 className="text-xl font-bold text-zinc-100">作成済みの部屋に参加する</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  友達が作成したルームコードを入力して、進行中のゲームや待機部屋に入室します。
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="ルームコード (例: ABCDEF)"
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3.5 text-center font-mono text-base tracking-widest uppercase text-white placeholder-zinc-600 outline-none focus:border-purple-500 transition-all"
              />
              <button
                type="submit"
                disabled={roomCodeInput.length < 6}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 px-6 py-3.5 font-bold text-sm text-white transition-all shadow-md cursor-pointer flex items-center justify-center"
              >
                参加する
              </button>
            </form>
          </div>

          {/* Quick instructions / Rule book summary */}
          <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-5 text-xs text-zinc-500 leading-relaxed">
            <h4 className="font-bold text-zinc-400 mb-2">💡 ito(イト)の基本ルール</h4>
            <p className="mb-1.5">
              1. プレイヤーはそれぞれ 1〜100 の秘密の数字が書かれたカードを1枚持ちます。
            </p>
            <p className="mb-1.5">
              2. 出されたお題（例：「欲しいもの」「怖いもの」など）に沿って、自分の持っている数字の大きさを「言葉」で表現し合います（数字自体を直接言うのは禁止です）。
            </p>
            <p>
              3. 全員で話し合い、自分たちの数字を小さい順に並べ替えることを目指す協力ゲームです。
            </p>
          </div>
        </div>

        {/* Right Column: Friends Section (Span 2) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-xl flex flex-col min-h-[420px] overflow-hidden">
            
            {/* Friends Header with Tabs */}
            <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-1.5 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFriendTab('list')}
                  className={`px-3 py-3 text-xs font-bold transition-all relative ${
                    activeFriendTab === 'list' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  フレンド ({friends.length})
                  {activeFriendTab === 'list' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveFriendTab('requests')}
                  className={`px-3 py-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                    activeFriendTab === 'requests' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  申請待ち
                  {incomingRequests.length > 0 && (
                    <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold animate-bounce">
                      {incomingRequests.length}
                    </span>
                  )}
                  {activeFriendTab === 'requests' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Friend Tab Body */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[300px]">
              {activeFriendTab === 'list' ? (
                friends.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-zinc-500 text-xs">フレンドはいません</p>
                    <p className="text-[10px] text-zinc-600 mt-1">下のフォームから追加できます</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map(friend => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-800/40 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {renderAvatar(friend.profileImage, 'w-9 h-9 text-base')}
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900 animate-pulse"></span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{friend.username}</div>
                            {friend.bio && (
                              <div className="text-[10px] text-zinc-500 max-w-[130px] truncate">
                                {friend.bio}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-lg transition-all"
                          title="フレンド削除"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Requests Tab */
                <div className="space-y-4">
                  {/* Incoming */}
                  <div>
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-2">受信した申請 ({incomingRequests.length})</h4>
                    {incomingRequests.length === 0 ? (
                      <p className="text-[10px] text-zinc-600 pl-1">受信した申請はありません</p>
                    ) : (
                      <div className="space-y-2">
                        {incomingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between p-2.5 bg-zinc-950/40 border border-zinc-800/40 rounded-xl">
                            <div className="flex items-center gap-2">
                              {renderAvatar(req.user.profileImage, 'w-8 h-8 text-sm')}
                              <div className="text-xs font-semibold text-zinc-200">{req.user.username}</div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleAcceptFriend(req.id)}
                                className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all cursor-pointer"
                              >
                                承認
                              </button>
                              <button
                                onClick={() => handleRejectFriend(req.id)}
                                className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                              >
                                拒否
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Outgoing */}
                  <div className="pt-2 border-t border-zinc-800/40">
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-2">送信した申請 ({outgoingRequests.length})</h4>
                    {outgoingRequests.length === 0 ? (
                      <p className="text-[10px] text-zinc-600 pl-1">送信した申請はありません</p>
                    ) : (
                      <div className="space-y-2">
                        {outgoingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-zinc-900/40 rounded-xl">
                            <div className="flex items-center gap-2 opacity-70">
                              {renderAvatar(req.user.profileImage, 'w-8 h-8 text-sm')}
                              <div className="text-xs font-semibold text-zinc-200">{req.user.username}</div>
                            </div>
                            <button
                              onClick={() => handleRejectFriend(req.id)}
                              className="px-2 py-1 text-[9px] font-bold text-zinc-500 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-all cursor-pointer"
                            >
                              キャンセル
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Friend Request Footer Form */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30">
              <form onSubmit={handleAddFriend} className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-300">フレンドを追加</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="ユーザー名 または メールアドレス"
                    value={friendQuery}
                    onChange={e => setFriendQuery(e.target.value)}
                    className="flex-1 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition-all cursor-pointer shadow-md"
                  >
                    申請
                  </button>
                </div>
                {friendError && <p className="text-[10px] text-red-400 mt-1">{friendError}</p>}
                {friendSuccess && <p className="text-[10px] text-emerald-400 mt-1">{friendSuccess}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- OPTIONS / PROFILE EDIT MODAL --- */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                プロフィール設定
              </h3>
              <button
                onClick={() => setShowOptionsModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-xs">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs animate-pulse">
                  {editSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  ユーザー名
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  自己紹介
                </label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  プロフィールアイコン
                </label>
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  {AVATAR_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditProfileImage(preset)}
                      className={`w-9 h-9 text-lg rounded-full flex items-center justify-center transition-all ${
                        editProfileImage === preset
                          ? 'bg-indigo-600 border border-indigo-400 scale-110 shadow-lg'
                          : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="または画像URLを入力"
                  value={editProfileImage}
                  onChange={e => setEditProfileImage(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  新しいパスワード (変更する場合のみ入力)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowOptionsModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  変更を保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
