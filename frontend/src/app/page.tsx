'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, type User } from '@/lib/session';
import { errorMessage } from '@/lib/error-message';
import { usePresence } from '@/lib/presence';
import { renderAvatar } from '@/lib/avatar';
import { FriendInfoWindow } from '@/lib/friend-info';

interface GameRecord {
  totalGames: number;
  successCount: number;
}

interface FriendshipRequest {
  id: number;
  user: User;
}

/** 検索候補。relation は自分から見たその相手との関係 */
interface SearchResult extends User {
  relation: 'friend' | 'pending' | 'none';
}

/** POST /api/auth/login, POST /api/auth/register */
interface AuthResponse {
  token: string;
  user: User;
}

/** GET /api/friends/requests */
interface FriendRequests {
  incoming: FriendshipRequest[];
  outgoing: FriendshipRequest[];
}

/** GET /api/users/me。戦績がまだ無いユーザーは gameRecord が null */
interface MeResponse extends User {
  gameRecord: GameRecord | null;
}

/**
 * 候補検索を投げる文字数の範囲。SearchUsersDto の @MinLength(2) @MaxLength(30) と揃える。
 *
 * 入力欄側に maxLength は付けないこと。同じ入力欄がフレンド申請
 * (POST /api/friends/request) も兼ねており、そちらは上限導入前に登録された
 * 長い username を検索不能にしないため意図的に上限なしになっているため
 * （backend/src/friends/dto/friends.dto.ts のコメント参照）。
 * ここで範囲外を弾くのは、400になると分かっているリクエストを投げないため。
 */
const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 30;

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
function isValidEmail(val: string): boolean {
  return EMAIL_REGEX.test(val.trim());
}

/** 重複チェックの応答。value はこの結果がどの入力値に対するものか */
interface AvailabilityCheck {
  value: string;
  /** 通信に失敗した時は判定なしとして 'idle' を入れる */
  status: Exclude<AvailabilityStatus, 'checking' | 'invalid'>;
}

/**
 * 入力値と最後に受け取った結果から、表示すべき状態を決める。
 * 結果がまだ今の入力値に追いついていなければ 'checking'。
 */
function availabilityStatus(
  value: string,
  check: AvailabilityCheck | null,
  disabled: boolean,
): AvailabilityStatus {
  if (disabled || !value.trim()) return 'idle';
  return check?.value === value ? check.status : 'checking';
}

export default function HomePage() {
  const router = useRouter();

  // DEVアカウント表示フラグ（本番では非表示、make test 時のみ表示）
  const showDevLogin = process.env.NEXT_PUBLIC_SHOW_DEV_LOGIN === 'true';

  // Auth states — 遷移をまたいで保つため layout の SessionProvider が持つ
  const { mounted, token, user, login, logout, updateUser, apiCall } = useSession();
  // Presence (online status) — /presence 名前空間から配信される。接続も Provider 側
  const { onlineFriendIds, unreadCounts, subscribe } = usePresence();
  /** ヘッダーのバッジは「未読メッセージの総件数」。内訳は /messages の一覧で出す */
  const totalUnread = [...unreadCounts.values()].reduce((sum, n) => sum + n, 0);

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');

  // Real-time registration validation
  /**
   * 重複チェックの結果は「どの入力値に対する答えか」とセットで持つ。
   * 表示用の状態(AvailabilityStatus)は入力値と突き合わせて導出するので、
   * 入力のたびに effect から同期的に 'checking' を書き込む必要がなくなる。
   * 遅れて届いた古い応答も value が一致せず無視される。
   */
  const [usernameCheck, setUsernameCheck] = useState<AvailabilityCheck | null>(null);
  const [emailCheck, setEmailCheck] = useState<AvailabilityCheck | null>(null);

  // Title/Form values
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Home states
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendshipRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendshipRequest[]>([]);
  const [friendQuery, setFriendQuery] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState('');
  /** 最後に受け取った検索結果と、その元になった検索語 */
  const [searchHits, setSearchHits] = useState<{
    query: string;
    results: SearchResult[];
  } | null>(null);
  const [activeFriendTab, setActiveFriendTab] = useState<'list' | 'requests' | 'blocks'>('list');
  const [roomCreateRounds, setRoomCreateRounds] = useState(3);
  // 部屋作成・参加・ルールのアコーディオン開閉ステート
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Modal states
  type ModalType = 'terms' | 'privacy' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Block states
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  /** フレンド詳細ウィンドウ。null なら非表示 */
  const [infoTarget, setInfoTarget] = useState<User | null>(null);
  /**
   * 拒否した直後にブロックを提示するための退避先。
   * 拒否するとFriendship行が消えてuserIdをサーバーから取り直せないため、
   * 拒否を実行する前にここへ保存しておく。
   */
  const [rejectedUser, setRejectedUser] = useState<User | null>(null);

  // Options / Profile edit modal states
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [gameRecord, setGameRecord] = useState<GameRecord | null>(null);

  const usernameStatus = availabilityStatus(username, usernameCheck, isLoginTab);
  const emailStatus =
    isLoginTab || !email.trim()
      ? 'idle'
      : !isValidEmail(email)
      ? 'invalid'
      : availabilityStatus(email, emailCheck, isLoginTab);

  // Real-time username availability check (register tab only)
  useEffect(() => {
    if (isLoginTab || !username.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data: { taken: boolean } = await res.json();
        setUsernameCheck({ value: username, status: data.taken ? 'taken' : 'available' });
      } catch {
        setUsernameCheck({ value: username, status: 'idle' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username, isLoginTab]);

  // Real-time email availability check (register tab only)
  useEffect(() => {
    if (isLoginTab || !email.trim() || !isValidEmail(email)) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
        if (!res.ok) {
          setEmailCheck({ value: email, status: 'idle' });
          return;
        }
        const data: { taken: boolean } = await res.json();
        setEmailCheck({ value: email, status: data.taken ? 'taken' : 'available' });
      } catch {
        setEmailCheck({ value: email, status: 'idle' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email, isLoginTab]);

  // Fetch Friends, Requests and Blocks
  // 購読 effect の依存に入れるため、token/apiCall が変わらない限り同一の関数にする
  const fetchFriendsData = useCallback(async () => {
    if (!token) return;
    try {
      const friendsList = await apiCall<User[]>('/api/friends');
      setFriends(friendsList);

      const reqs = await apiCall<FriendRequests>('/api/friends/requests');
      setIncomingRequests(reqs.incoming || []);
      setOutgoingRequests(reqs.outgoing || []);

      const blocks = await apiCall<User[]>('/api/friends/blocks');
      setBlockedUsers(blocks || []);
    } catch (e) {
      console.error(e);
    }
  }, [token, apiCall]);

  useEffect(() => {
    // fetchFriendsData 内の setState はすべて await より後（= 同期的には走らない）。
    // ルールは async 関数の中身を保守的に見て「effect 内の同期 setState」と判定するが、
    // ここで連鎖レンダリングは起きないため個別に抑制する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchFriendsData();
  }, [fetchFriendsData]);

  /*
   * フレンド追加フォームの候補検索（400msデバウンス）。
   * 結果は「どの検索語に対する結果か」とセットで持ち、表示は導出する。
   * こうすると入力のたびに effect から同期的にリストを空にする必要がなく、
   * 遅れて届いた古い応答も検索語が一致せず捨てられる。
   */
  const searchQuery = friendQuery.trim();
  const searchEnabled =
    !!token &&
    searchQuery.length >= SEARCH_MIN_LENGTH &&
    searchQuery.length <= SEARCH_MAX_LENGTH;
  const searchSettled = searchEnabled && searchHits?.query === searchQuery;
  const searchLoading = searchEnabled && !searchSettled;
  const searchResults = searchSettled ? searchHits.results : [];

  /*
   * フォーム下部の「申請」ボタンの可否。
   * POST /api/friends/request は username の完全一致なので、居ない相手に送ると 404 が
   * コンソールに出る。候補検索が「未フレンドのその人が居る」と答えた時だけ押せる。
   *
   * 検索を投げない長さ（1文字 / SEARCH_MAX_LENGTH 超）でも押せないことになるが、
   * それらの username は存在しない（register は @MaxLength(30)、1文字は検索できないため
   * そもそも到達手段が無い）ので実害はない。ここを開けると 404 の抜け道になる。
   *
   * 検索は大文字小文字を区別しないが申請は区別するので、突き合わせは厳密一致で行う。
   * 既にフレンド・申請中の相手も 400 になるので同じく止める（候補行に状態が出る）。
   */
  const exactMatch = searchResults.find(r => r.username === searchQuery);
  const canSubmitRequest = exactMatch?.relation === 'none';

  useEffect(() => {
    const q = friendQuery.trim();
    if (!token || q.length < SEARCH_MIN_LENGTH || q.length > SEARCH_MAX_LENGTH) return;
    const timer = setTimeout(async () => {
      try {
        const results = await apiCall<SearchResult[]>(
          `/api/friends/search?q=${encodeURIComponent(q)}`,
        );
        setSearchHits({ query: q, results: results || [] });
      } catch {
        setSearchHits({ query: q, results: [] });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [friendQuery, token, apiCall]);

  /**
   * フレンド関連の通知でフレンド一覧を取り直す。
   * 通知はトリガーとしてのみ使い、差分適用はしない（状態の二重管理を避けるため）。
   * 接続そのものは PresenceProvider が持つので、ここでは購読するだけ。
   */
  useEffect(() => {
    if (!token) return;
    const refresh = () => void fetchFriendsData();
    const unsubscribeRequest = subscribe('friend:requestReceived', refresh);
    const unsubscribeAccepted = subscribe('friend:accepted', refresh);
    return () => {
      unsubscribeRequest();
      unsubscribeAccepted();
    };
  }, [token, subscribe, fetchFriendsData]);

  // Auth handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      if (isLoginTab) {
        // Login
        const data = await apiCall<AuthResponse>('/api/auth/login', 'POST', {
          email,
          password,
        });
        login(data.token, data.user);
      } else {
        // Register
        if (!isValidEmail(email)) {
          setAuthError('有効なメールアドレスを入力してください。');
          return;
        }
        const data = await apiCall<AuthResponse>('/api/auth/register', 'POST', {
          email: email.trim(),
          username,
          password,
          bio: '',
          profileImage: '',
        });
        // 完了メッセージを見せてからログイン状態にする（画面が切り替わるのは900ms後）
        setRegisterSuccessMsg('🎉 登録が完了しました！');
        setTimeout(() => login(data.token, data.user), 900);
      }
    } catch (err) {
      setAuthError(
        errorMessage(err, '認証に失敗しました。入力内容を確認してください。'),
      );
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
      const data = await apiCall<AuthResponse>('/api/auth/login', 'POST', {
        email,
        password,
      });
      login(data.token, data.user);
    } catch (err) {
      setAuthError(errorMessage(err, '開発者ログインに失敗しました。'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Clear forms
    setEmail('');
    setUsername('');
    setPassword('');
    setRegisterSuccessMsg('');
    setAuthModal(null);
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
  const sendFriendRequest = async (username: string) => {
    setFriendError('');
    setFriendSuccess('');
    try {
      await apiCall('/api/friends/request', 'POST', { query: username });
      setFriendSuccess('フレンド申請を送信しました！');
      // 検索語を空にすれば候補は導出側で空になるので、結果を明示的に消す必要はない
      setFriendQuery('');
      void fetchFriendsData();
    } catch (err) {
      setFriendError(errorMessage(err, '申請に失敗しました。'));
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    // 送信ボタンは disabled にしてあるが、入力欄での Enter による送信は
    // ボタンを経由しないブラウザもあるためここでも見る
    if (!canSubmitRequest) return;
    await sendFriendRequest(searchQuery);
  };

  const handleAcceptFriend = async (friendshipId: number) => {
    try {
      await apiCall('/api/friends/accept', 'POST', { friendshipId });
      void fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectFriend = async (friendshipId: number, user?: User) => {
    try {
      await apiCall('/api/friends/reject', 'POST', { friendshipId });
      if (user) setRejectedUser(user);
      void fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    try {
      await apiCall('/api/friends/remove', 'POST', { friendId });
      setInfoTarget(null);
      void fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlockUser = async (userId: number) => {
    try {
      await apiCall('/api/friends/block', 'POST', { userId });
      setInfoTarget(null);
      setRejectedUser(null);
      void fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    if (!confirm('ブロックを解除しますか？\n解除してもフレンド関係は元に戻りません。')) return;
    try {
      await apiCall('/api/friends/unblock', 'POST', { userId });
      void fetchFriendsData();
    } catch (e) {
      console.error(e);
    }
  };

  const openInfo = (friend: User) => {
    setInfoTarget(friend);
  };

  const switchFriendTab = (tab: 'list' | 'requests' | 'blocks') => {
    setActiveFriendTab(tab);
    setRejectedUser(null);
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
    setGameRecord(null);
    setShowOptionsModal(true);

    apiCall<MeResponse>('/api/users/me')
      .then(data => setGameRecord(data.gameRecord ?? { totalGames: 0, successCount: 0 }))
      .catch(() => setGameRecord({ totalGames: 0, successCount: 0 }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditProfileImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    if (editBio.length > 100) {
      setEditError('自己紹介は100文字以内で入力してください。');
      return;
    }
    if (editPassword && editPassword.length < 8) {
      setEditError('新しいパスワードは8文字以上で入力してください。');
      return;
    }
    if (!editUsername.trim()) {
      setEditError('ユーザー名を入力してください。');
      return;
    }

    try {
      const updated = await apiCall<User>('/api/users/me', 'PUT', {
        username: editUsername,
        bio: editBio,
        profileImage: editProfileImage,
        password: editPassword || undefined,
      });

      updateUser(updated);
      setEditSuccess('プロフィールを更新しました！');
      setTimeout(() => setShowOptionsModal(false), 1000);
    } catch (err) {
      setEditError(errorMessage(err, '更新に失敗しました。'));
    }
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
      <main className="h-dvh min-h-screen flex flex-col justify-between items-center bg-[#050811] text-white relative overflow-hidden px-4 py-4 sm:py-6 select-none font-sans">
        {/* Fullscreen Game Background Texture */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <Image
            src="/title-bg-clean.jpg"
            alt="Game Background"
            fill
            priority
            className="object-cover object-center scale-105 opacity-100"
          />
          {/* Subtle bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050811]/90 via-transparent to-[#050811]/40 pointer-events-none" />
        </div>

        {/* Main Content Area (Logo & Action Buttons) */}
        <div className="z-10 flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto py-2">
          {/* Dynamically Scaled 4ito Logo Container */}
          <div className="flex-1 flex items-center justify-center min-h-0 w-full px-4 my-auto">
            <div className="relative w-full max-w-[82vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl flex items-center justify-center">
              <Image
                src="/4ito-logo.png"
                alt="4ito"
                width={1000}
                height={536}
                priority
                className="w-full h-auto max-h-[30vh] sm:max-h-[36vh] md:max-h-[42vh] lg:max-h-[46vh] object-contain select-none"
              />
            </div>
          </div>

          {/* Action Menu Buttons */}
          <div className="w-full text-center space-y-3 sm:space-y-4 pt-2 pb-4 sm:pb-6 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 px-4 max-w-md sm:max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(true);
                  setAuthModal('login');
                  setAuthError('');
                  setRegisterSuccessMsg('');
                }}
                className="w-full sm:w-60 py-3.5 sm:py-4 px-8 rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-white border border-white/40 hover:border-white/80 shadow-2xl backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                ログイン
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(false);
                  setAuthModal('register');
                  setAuthError('');
                  setRegisterSuccessMsg('');
                }}
                className="w-full sm:w-60 py-3.5 sm:py-4 px-8 rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-white border border-white/40 hover:border-white/80 shadow-2xl backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                新規登録
              </button>
            </div>

            {/* Quick Dev Login (make test 時のみ表示) */}
            {showDevLogin && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">DEV:</span>
                <button
                  type="button"
                  onClick={() => handleDevLogin(1)}
                  disabled={loading}
                  className="px-3 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-all cursor-pointer"
                >
                  Dev1 🚀
                </button>
                <button
                  type="button"
                  onClick={() => handleDevLogin(2)}
                  disabled={loading}
                  className="px-3 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-all cursor-pointer"
                >
                  Dev2 👾
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="z-10 flex justify-center gap-6 py-2 shrink-0">
          <button type="button" onClick={() => setActiveModal('terms')} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">利用規約</button>
          <span className="text-zinc-600 text-xs">•</span>
          <button type="button" onClick={() => setActiveModal('privacy')} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">プライバシーポリシー</button>
        </footer>

        {/* --- AUTH MODAL (Login / Register Modal) --- */}
        {authModal && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 animate-in fade-in duration-200"
            onClick={() => setAuthModal(null)}
          >
            <div
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setAuthModal(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="閉じる"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {isLoginTab ? 'ログイン' : '新規登録'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {isLoginTab ? 'アカウント情報を入力してください' : 'アカウントを作成してゲームを開始します'}
                </p>
              </div>

              {registerSuccessMsg ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-2xl">{registerSuccessMsg}</p>
                  <p className="text-zinc-400 text-sm">ホーム画面に移動します...</p>
                </div>
              ) : (
                <>
                  {/* Form Tabs */}
                  <div className="flex border-b border-zinc-800 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginTab(true);
                        setAuthError('');
                        setRegisterSuccessMsg('');
                      }}
                      className={`flex-1 pb-3 text-center font-semibold text-sm transition-all duration-200 cursor-pointer ${
                        isLoginTab
                          ? 'text-white border-b-2 border-white font-bold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      ログイン
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginTab(false);
                        setAuthError('');
                        setRegisterSuccessMsg('');
                      }}
                      className={`flex-1 pb-3 text-center font-semibold text-sm transition-all duration-200 cursor-pointer ${
                        !isLoginTab
                          ? 'text-white border-b-2 border-white font-bold'
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
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="example@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all text-sm"
                      />
                      {!isLoginTab && emailStatus !== 'idle' && (
                        <p className={`mt-1 text-xs ${
                          emailStatus === 'taken' || emailStatus === 'invalid' ? 'text-red-400' :
                          emailStatus === 'available' ? 'text-emerald-400' : 'text-zinc-500'
                        }`}>
                          {emailStatus === 'checking' && '確認中...'}
                          {emailStatus === 'invalid' && 'メールアドレスの形式が正しくありません'}
                          {emailStatus === 'taken' && 'そのメールアドレスはすでに使われています'}
                          {emailStatus === 'available' && '使用可能です'}
                        </p>
                      )}
                    </div>

                    {!isLoginTab && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                          ユーザー名
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="ゲームに表示される名前"
                          maxLength={30}
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all text-sm"
                        />
                        {usernameStatus !== 'idle' && (
                          <p className={`mt-1 text-xs ${
                            usernameStatus === 'taken' ? 'text-red-400' :
                            usernameStatus === 'available' ? 'text-emerald-400' : 'text-zinc-500'
                          }`}>
                            {usernameStatus === 'checking' && '確認中...'}
                            {usernameStatus === 'taken' && 'そのユーザー名はすでに使われています'}
                            {usernameStatus === 'available' && '使用可能です'}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                        パスワード
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-white placeholder-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all text-sm"
                      />
                      {!isLoginTab && password.length > 0 && (
                        <p className={`mt-1 text-xs ${password.length >= 8 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {password.length >= 8 ? '使用可能な長さです' : `あと${8 - password.length}文字以上必要です（8文字以上）`}
                        </p>
                      )}
                    </div>

                    {!isLoginTab && (
                      <div className="text-xs text-zinc-500 text-center mt-2 mb-2">
                        アカウントを登録することで、
                        <button type="button" onClick={() => setActiveModal('terms')} className="text-zinc-300 hover:text-white underline cursor-pointer mx-1">利用規約</button>
                        と
                        <button type="button" onClick={() => setActiveModal('privacy')} className="text-zinc-300 hover:text-white underline cursor-pointer mx-1">プライバシーポリシー</button>
                        に同意したものとみなされます。
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        (!isLoginTab && (
                          usernameStatus === 'taken' ||
                          usernameStatus === 'checking' ||
                          emailStatus === 'taken' ||
                          emailStatus === 'checking' ||
                          emailStatus === 'invalid' ||
                          password.length < 8
                        ))
                      }
                      className="w-full mt-2 rounded-lg bg-white hover:bg-zinc-200 px-4 py-3 font-semibold text-sm text-zinc-950 disabled:opacity-50 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-zinc-950"></div>
                          通信中...
                        </>
                      ) : isLoginTab ? (
                        'ログイン'
                      ) : (
                        'アカウント登録して開始'
                      )}
                    </button>

                    {/* 開発者テスト (make test 時のみ表示) */}
                    {showDevLogin && (
                      <>
                        <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-zinc-800"></div>
                          <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-wider font-medium">開発者テスト</span>
                          <div className="flex-grow border-t border-zinc-800"></div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDevLogin(1)}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-3 py-2 font-bold text-xs text-zinc-300 font-mono transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            Dev1 🚀
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDevLogin(2)}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-3 py-2 font-bold text-xs text-zinc-300 font-mono transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            Dev2 👾
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* --- TERMS & PRIVACY MODAL --- */}
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setActiveModal(null)}>
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-zinc-100">
                  {activeModal === 'terms' ? '利用規約' : 'プライバシーポリシー'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 text-sm text-zinc-300 space-y-4">
                {activeModal === 'terms' ? (
                  <>
                    <h4 className="font-bold text-white">第1条（適用）</h4>
                    <p>本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>

                    <h4 className="font-bold text-white mt-4">第2条（ユーザー登録）</h4>
                    <p>本サービスの利用を希望する者は、本規約に同意の上、運営者が定める方法によってユーザー登録を行うものとします。</p>

                    <h4 className="font-bold text-white mt-4">第3条（アカウントの管理）</h4>
                    <p>ユーザーは、自己の責任において、本サービスのアカウントおよびパスワードを適切に管理するものとします。いかなる場合にも、これらを第三者に譲渡または貸与することはできません。</p>

                    <h4 className="font-bold text-white mt-4">第4条（禁止事項）</h4>
                    <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                      <li>法令または公序良俗に違反する行為</li>
                      <li>犯罪行為に関連する行為</li>
                      <li>運営者、他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                      <li>本サービス内でのチャット機能を利用した、他のユーザーに対する誹謗中傷、脅迫、いやがらせ、スパム送信、その他不適切な発言を行う行為</li>
                      <li>ゲームの進行を意図的に妨害する、または本来のゲーム性から著しく逸脱する行為</li>
                      <li>その他、運営者が不適切と判断する行為</li>
                    </ul>

                    <h4 className="font-bold text-white mt-4">第5条（本サービスの提供の停止等）</h4>
                    <p>運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                      <li>保守点検または更新を行う場合</li>
                      <li>不可抗力により、本サービスの提供が困難となった場合</li>
                      <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
                    </ul>

                    <h4 className="font-bold text-white mt-4">第6条（免責事項）</h4>
                    <p>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。本サービスは現状有姿で提供され、安全性や正確性などについていかなる保証も行いません。</p>

                    <h4 className="font-bold text-white mt-4">第7条（利用規約の変更）</h4>
                    <p>運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。</p>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-white">第1条（取得する個人情報）</h4>
                    <p>本サービスでは、ユーザーが登録・利用するにあたり、以下の情報を取得します。</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                      <li>メールアドレス、パスワード等のアカウント情報</li>
                      <li>ユーザー名、自己紹介文、プロフィール画像</li>
                      <li>チャットのメッセージ内容、フレンド関係、ゲームの戦績などの利用履歴</li>
                      <li>端末情報、アクセスログ等の利用環境に関する情報</li>
                    </ul>

                    <h4 className="font-bold text-white mt-4">第2条（利用目的）</h4>
                    <p>取得した個人情報は、以下の目的で利用いたします。</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                      <li>本サービスの提供および運営のため（ゲーム機能、チャット機能、マッチングなど）</li>
                      <li>ユーザーからのお問い合わせへの対応のため</li>
                      <li>利用規約に違反する行為や、不正・不当な目的でサービスを利用しようとするユーザーの特定および対応のため</li>
                      <li>本サービスの改善や新機能の開発に役立てるため</li>
                    </ul>

                    <h4 className="font-bold text-white mt-4">第3条（個人情報の第三者提供）</h4>
                    <p>運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                      <li>人の生命、身体または財産の保護のために必要がある場合</li>
                      <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                      <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
                    </ul>

                    <h4 className="font-bold text-white mt-4">第4条（安全管理措置）</h4>
                    <p>運営者は、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備等の必要な措置を講じます。</p>

                    <h4 className="font-bold text-white mt-4">第5条（プライバシーポリシーの変更）</h4>
                    <p>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができるものとします。</p>
                  </>
                )}
              </div>

              <div className="px-6 py-4 border-t border-zinc-800 shrink-0 flex justify-end">
                <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer">
                  確認しました
                </button>
              </div>
            </div>
          </div>
        )}
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
            <span className="text-xl font-black tracking-widest text-white px-1">4ITO</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* ユーザープロフィールボタン（クリックで設定・プロフィール表示） */}
          <button
            type="button"
            onClick={openOptions}
            className="flex items-center gap-3 bg-zinc-900/60 hover:bg-zinc-800/90 pl-2.5 pr-4 py-1.5 rounded-full border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group text-left"
            title="プロフィールを表示・編集"
          >
            <div className="relative">
              {renderAvatar(user.profileImage, 'w-8 h-8 text-base group-hover:scale-105 transition-transform')}
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {user.username}
              </div>
              {user.bio && <div className="text-[10px] text-zinc-500 truncate max-w-[100px]">{user.bio}</div>}
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900/60 hover:bg-red-950/20 rounded-full border border-zinc-800/80 hover:border-red-900/50 transition-all cursor-pointer"
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
        <div className="md:col-span-3 space-y-6">
          {/* Create Room Card */}
          <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-600/20 transition-all"></div>
            
            {/* クリック可能なヘッダー */}
            <div
              onClick={() => setIsCreateRoomOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none"
              role="button"
              aria-expanded={isCreateRoomOpen}
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600/10 p-3.5 rounded-xl border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600/20 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                    部屋を作成
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    部屋を作成し、フレンドを招待したり、招待コードを共有しよう！
                  </p>
                </div>
              </div>

              {/* 開閉インジケーター（矢印アイコン） */}
              <div
                className={`p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 group-hover:text-zinc-200 transition-all duration-300 ${
                  isCreateRoomOpen ? 'rotate-180 bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* アコーディオン展開エリア（クリックで下に伸びて出現） */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isCreateRoomOpen ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden space-y-4">
                {/* ラウンド数設定 */}
                <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800/85 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      ラウンド数
                    </label>
                  </div>

                  {/* 1〜5 のセレクトボタン */}
                  <div className="flex justify-between items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoomCreateRounds(r)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                          roomCreateRounds === r
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400 scale-[1.02]'
                            : 'bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 新規ルームを作成ボタン */}
                <button
                  onClick={handleCreateRoom}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3.5 font-bold text-sm text-white transition-all shadow-md hover:shadow-indigo-500/10 hover:scale-[1.005] active:scale-[0.995] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  部屋を作る
                </button>
              </div>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
            {/* クリック可能なヘッダー */}
            <div
              onClick={() => setIsJoinRoomOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none"
              role="button"
              aria-expanded={isJoinRoomOpen}
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-600/10 p-3.5 rounded-xl border border-purple-500/20 text-purple-400 group-hover:bg-purple-600/20 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-100">部屋に参加</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    コードを入力して、部屋に参加しよう！
                  </p>
                </div>
              </div>

              {/* 開閉インジケーター（矢印アイコン） */}
              <div
                className={`p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 group-hover:text-zinc-200 transition-all duration-300 ${
                  isJoinRoomOpen ? 'rotate-180 bg-purple-600/20 border-purple-500/40 text-purple-400' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* アコーディオン展開エリア（クリックで下に伸びて出現） */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isJoinRoomOpen ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden">
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  {/* 1段目: ルームコード入力エリア */}
                  <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800/85 space-y-2.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        ルームコード
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="例: ABCDEF"
                      value={roomCodeInput}
                      onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.25em] uppercase text-white placeholder-zinc-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                  </div>

                  {/* 2段目: 参加するボタン */}
                  <button
                    type="submit"
                    disabled={roomCodeInput.length < 6}
                    className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 px-4 py-3.5 font-bold text-sm text-white transition-all shadow-md hover:shadow-purple-500/10 hover:scale-[1.005] active:scale-[0.995] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    部屋に参加
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Rules Card (Accordion) */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden group hover:border-zinc-700/60 transition-all duration-300">
            {/* クリック可能なヘッダー */}
            <div
              onClick={() => setIsRulesOpen(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none"
              role="button"
              aria-expanded={isRulesOpen}
            >
              <div className="flex items-center gap-3">
                <h4 className="text-base sm:text-lg font-bold text-zinc-200 group-hover:text-white transition-colors">
                  ito の基本ルール
                </h4>
              </div>

              {/* 開閉インジケーター（矢印アイコン） */}
              <div
                className={`p-2 rounded-xl bg-zinc-800/40 border border-zinc-800/60 text-zinc-400 group-hover:text-zinc-200 transition-all duration-300 ${
                  isRulesOpen ? 'rotate-180 bg-zinc-800/80 text-zinc-200' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* アコーディオン展開エリア */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isRulesOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden text-sm sm:text-base text-zinc-300 leading-relaxed space-y-3.5 pt-3 border-t border-zinc-800/60">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-xs flex items-center justify-center mt-0.5">
                    1
                  </span>
                  <p className="flex-1">
                    プレイヤーはそれぞれ <span className="text-indigo-300 font-semibold">1〜100</span> の数字が書かれたカードを1枚持ちます。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-xs flex items-center justify-center mt-0.5">
                    2
                  </span>
                  <p className="flex-1">
                    出されたお題（例：「欲しいもの」「怖いもの」など）に沿って、自分の持っている数字の大きさを<span className="text-amber-300 font-semibold">「言葉」</span>で表現し合います（<span className="text-red-300">数字自体を直接言うのは禁止</span>です）。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-xs flex items-center justify-center mt-0.5">
                    3
                  </span>
                  <p className="flex-1">
                    全員で話し合い、自分たちの数字を<span className="text-emerald-300 font-semibold">小さい順に並べ替える</span>ことを目指す協力ゲームです。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Friends Section (Span 2) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-xl flex flex-col min-h-[420px] overflow-hidden">
            <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => switchFriendTab('list')}
                  className={`px-3 py-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${activeFriendTab === 'list' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  フレンド ({friends.length})
                  {totalUnread > 0 && (
                    <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold animate-bounce">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                  {activeFriendTab === 'list' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                  )}
                </button>
                <button
                  onClick={() => router.push('/messages')}
                  className="px-3 py-3 text-xs font-bold transition-all relative flex items-center gap-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded-lg cursor-pointer group"
                  title="チャット一覧を開く"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>チャット</span>
                  {totalUnread > 0 && (
                    <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold animate-bounce">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => switchFriendTab('requests')}
                  className={`px-3 py-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${activeFriendTab === 'requests' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
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
                {blockedUsers.length > 0 && (
                  <button
                    onClick={() => switchFriendTab('blocks')}
                    className={`px-3 py-3 text-xs font-bold transition-all relative ${activeFriendTab === 'blocks' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    ブロック中 ({blockedUsers.length})
                    {activeFriendTab === 'blocks' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                    )}
                  </button>
                )}
              </div>
            </div>

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
                    {friends.map(friend => {
                      const friendUnread = unreadCounts.get(friend.id) ?? 0;
                      return (
                        <div
                          key={friend.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                            friendUnread > 0
                              ? 'bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                              : 'bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {renderAvatar(friend.profileImage, 'w-9 h-9 text-base')}
                              {onlineFriendIds.has(friend.id) ? (
                                <span
                                  className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900"
                                  title="オンライン"
                                ></span>
                              ) : (
                                <span
                                  className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-zinc-600 ring-2 ring-zinc-900"
                                  title="オフライン"
                                ></span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                                <span>{friend.username}</span>
                                {friendUnread > 0 && (
                                  <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                                    未読 {friendUnread}
                                  </span>
                                )}
                              </div>
                              {friend.bio && (
                                <div className="text-[10px] text-zinc-500 max-w-[130px] truncate">
                                  {friend.bio}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => router.push(`/messages?to=${friend.id}`)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                                friendUnread > 0
                                  ? 'text-indigo-300 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/60 shadow-sm'
                                  : 'text-zinc-500 hover:text-indigo-400 hover:bg-indigo-950/20 border border-transparent hover:border-indigo-900/30'
                              }`}
                              title={`${friend.username}とチャット（未読${friendUnread}件）`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {friendUnread > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-1 bg-indigo-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                  {friendUnread > 99 ? '99+' : friendUnread}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => openInfo(friend)}
                              className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-950/20 border border-transparent hover:border-indigo-900/30 rounded-lg transition-all cursor-pointer"
                              title="詳細"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : activeFriendTab === 'requests' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-2">受信した申請 ({incomingRequests.length})</h4>
                    {rejectedUser && (
                      <div className="mb-2 p-3 bg-zinc-950/60 border border-indigo-900/40 rounded-xl">
                        <div className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-[11px] font-semibold text-zinc-200">
                              {rejectedUser.username} の申請を拒否しました
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                              このままでは再び申請が届く可能性があります。ブロックすると今後この人からの申請を受け取らなくなります。
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => handleBlockUser(rejectedUser.id)}
                            className="px-2.5 py-1 text-[10px] font-bold text-white bg-red-700 hover:bg-red-600 rounded-lg transition-all cursor-pointer"
                          >
                            ブロック
                          </button>
                          <button
                            onClick={() => setRejectedUser(null)}
                            className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                          >
                            閉じる
                          </button>
                        </div>
                      </div>
                    )}
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
                                onClick={() => handleRejectFriend(req.id, req.user)}
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
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-zinc-600 mb-2 leading-relaxed">
                    ブロック中のユーザーからは申請が届きません。解除してもフレンド関係は元に戻りません。
                  </p>
                  {blockedUsers.map(blocked => (
                    <div key={blocked.id} className="flex items-center justify-between p-2.5 bg-zinc-950/40 border border-zinc-800/40 rounded-xl">
                      <div className="flex items-center gap-2 opacity-70">
                        {renderAvatar(blocked.profileImage, 'w-8 h-8 text-sm')}
                        <div className="text-xs font-semibold text-zinc-200">{blocked.username}</div>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(blocked.id)}
                        className="px-2.5 py-1 text-[10px] font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all cursor-pointer"
                      >
                        解除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30">
              <form onSubmit={handleAddFriend} className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-300">フレンドを追加</h3>
                {/* 検索を投げた時だけ出す。投げていないのに「いません」と言わないため */}
                {searchEnabled && (
                  <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
                    {searchLoading ? (
                      <p className="px-3 py-2 text-[10px] text-zinc-600">検索中…</p>
                    ) : searchResults.length === 0 ? (
                      <p className="px-3 py-2 text-[10px] text-zinc-600">一致するユーザーはいません</p>
                    ) : (
                      searchResults.map(result => (
                        <div key={result.id} className="flex items-center justify-between px-2.5 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {renderAvatar(result.profileImage, 'w-7 h-7 text-xs')}
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-zinc-200 truncate">{result.username}</div>
                              {result.bio && (
                                <div className="text-[9px] text-zinc-600 max-w-[120px] truncate">{result.bio}</div>
                              )}
                            </div>
                          </div>
                          {result.relation === 'friend' ? (
                            <span className="px-2 py-1 text-[9px] font-bold text-zinc-500 shrink-0">フレンド済み</span>
                          ) : result.relation === 'pending' ? (
                            <span className="px-2 py-1 text-[9px] font-bold text-zinc-500 shrink-0">申請中</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => sendFriendRequest(result.username)}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all cursor-pointer shrink-0"
                            >
                              申請
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="ユーザー名"
                    value={friendQuery}
                    onChange={e => setFriendQuery(e.target.value)}
                    className="flex-1 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!canSubmitRequest}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-xs font-bold text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shadow-md"
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

      {infoTarget && (
        <FriendInfoWindow
          key={infoTarget.id}
          friend={infoTarget}
          online={onlineFriendIds.has(infoTarget.id)}
          onClose={() => setInfoTarget(null)}
          onMessage={() => router.push(`/messages?to=${infoTarget.id}`)}
          onRemoveFriend={handleRemoveFriend}
          onBlock={handleBlockUser}
        />
      )}

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
                  maxLength={30}
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    自己紹介
                  </label>
                  <span
                    className={`text-xs tabular-nums ${
                      editBio.length > 100
                        ? 'text-red-400 font-bold'
                        : editBio.length === 100
                        ? 'text-amber-400 font-medium'
                        : 'text-zinc-500'
                    }`}
                  >
                    {editBio.length} / 100
                  </span>
                </div>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={2}
                  className={`w-full rounded-lg bg-zinc-950 border ${
                    editBio.length > 100
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-800 focus:border-indigo-500'
                  } px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none transition-all resize-none`}
                />
                {editBio.length > 100 && (
                  <p className="mt-1 text-xs text-red-400">
                    自己紹介は100文字以内で入力してください（現在 {editBio.length} 文字）
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  プロフィールアイコン
                </label>
                <div className="flex items-center gap-4 mb-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="shrink-0">
                    {renderAvatar(editProfileImage, 'w-12 h-12 text-2xl')}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={handleImageSelect}
                      className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer"
                    />
                  </div>
                </div>
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

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  ito 戦績
                </p>
                {gameRecord === null ? (
                  <div className="text-xs text-zinc-500">読み込み中...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{gameRecord.totalGames}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">対局数</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-400">{gameRecord.successCount}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">成功数</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-indigo-400">
                        {gameRecord.totalGames > 0
                          ? Math.round((gameRecord.successCount / gameRecord.totalGames) * 100)
                          : 0}
                        %
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">成功率</div>
                    </div>
                  </div>
                )}
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
                  disabled={
                    editBio.length > 100 ||
                    !editUsername.trim() ||
                    (editPassword.length > 0 && editPassword.length < 8)
                  }
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  変更を保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* フッター */}
      <footer className="mt-8 py-6 border-t border-zinc-900/80 text-center w-full flex justify-center gap-6">
        <button type="button" onClick={() => setActiveModal('terms')} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">利用規約</button>
        <button type="button" onClick={() => setActiveModal('privacy')} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">プライバシーポリシー</button>
      </footer>

      {/* --- TERMS & PRIVACY MODAL (ログイン後用) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setActiveModal(null)}>
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-zinc-100">
                {activeModal === 'terms' ? '利用規約' : 'プライバシーポリシー'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-sm text-zinc-300 space-y-4">
              {activeModal === 'terms' ? (
                <>
                  <h4 className="font-bold text-white">第1条（適用）</h4>
                  <p>本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>

                  <h4 className="font-bold text-white mt-4">第2条（ユーザー登録）</h4>
                  <p>本サービスの利用を希望する者は、本規約に同意の上、運営者が定める方法によってユーザー登録を行うものとします。</p>

                  <h4 className="font-bold text-white mt-4">第3条（アカウントの管理）</h4>
                  <p>ユーザーは、自己の責任において、本サービスのアカウントおよびパスワードを適切に管理するものとします。いかなる場合にも、これらを第三者に譲渡または貸与することはできません。</p>

                  <h4 className="font-bold text-white mt-4">第4条（禁止事項）</h4>
                  <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>運営者、他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                    <li>本サービス内でのチャット機能を利用した、他のユーザーに対する誹謗中傷、脅迫、いやがらせ、スパム送信、その他不適切な発言を行う行為</li>
                    <li>ゲームの進行を意図的に妨害する、または本来のゲーム性から著しく逸脱する行為</li>
                    <li>その他、運営者が不適切と判断する行為</li>
                  </ul>

                  <h4 className="font-bold text-white mt-4">第5条（本サービスの提供の停止等）</h4>
                  <p>運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                    <li>保守点検または更新を行う場合</li>
                    <li>不可抗力により、本サービスの提供が困難となった場合</li>
                    <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
                  </ul>

                  <h4 className="font-bold text-white mt-4">第6条（免責事項）</h4>
                  <p>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。本サービスは現状有姿で提供され、安全性や正確性などについていかなる保証も行いません。</p>

                  <h4 className="font-bold text-white mt-4">第7条（利用規約の変更）</h4>
                  <p>運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。</p>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-white">第1条（取得する個人情報）</h4>
                  <p>本サービスでは、ユーザーが登録・利用するにあたり、以下の情報を取得します。</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                    <li>メールアドレス、パスワード等のアカウント情報</li>
                    <li>ユーザー名、自己紹介文、プロフィール画像</li>
                    <li>チャットのメッセージ内容、フレンド関係、ゲームの戦績などの利用履歴</li>
                    <li>端末情報、アクセスログ等の利用環境に関する情報</li>
                  </ul>

                  <h4 className="font-bold text-white mt-4">第2条（利用目的）</h4>
                  <p>取得した個人情報は、以下の目的で利用いたします。</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                    <li>本サービスの提供および運営のため（ゲーム機能、チャット機能、マッチングなど）</li>
                    <li>ユーザーからのお問い合わせへの対応のため</li>
                    <li>利用規約に違反する行為や、不正・不当な目的でサービスを利用しようとするユーザーの特定および対応のため</li>
                    <li>本サービスの改善や新機能の開発に役立てるため</li>
                  </ul>

                  <h4 className="font-bold text-white mt-4">第3条（個人情報の第三者提供）</h4>
                  <p>運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。</p>
                  <ul className="list-disc pl-5 space-y-1 mt-2 text-zinc-400">
                    <li>人の生命、身体または財産の保護のために必要がある場合</li>
                    <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                    <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
                  </ul>

                  <h4 className="font-bold text-white mt-4">第4条（安全管理措置）</h4>
                  <p>運営者は、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備等の必要な措置を講じます。</p>

                  <h4 className="font-bold text-white mt-4">第5条（プライバシーポリシーの変更）</h4>
                  <p>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができるものとします。</p>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 shrink-0 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer">
                確認しました
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
