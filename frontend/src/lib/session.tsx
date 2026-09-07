'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface User {
  id: number;
  /** /api/friends は email を返さない（フレンド全員に配らないため）ので optional */
  email?: string;
  username: string;
  bio?: string;
  profileImage?: string;
}

/**
 * APIリトライ設定。
 * `make up` 直後はフロントが先に起動し、バックエンドのコンパイル完了まで
 * 30〜40秒ほど nginx が 502 を返す。その間の操作を自動で吸収するためのもの。
 * 実測の起動時間に余裕を持たせて締め切りを60秒に置く（回数ではなく経過時間で打ち切る）。
 */
const API_RETRY_DEADLINE_MS = 60_000;
const API_RETRY_BASE_DELAY_MS = 500;
const API_RETRY_MAX_DELAY_MS = 5_000;

/**
 * 1リクエストあたりの上限。
 * fetch には既定のタイムアウトが無く、応答も失敗も返らないまま止まると
 * apiCall が永久に返らず、呼び出し側のローディング表示が固まったままになる。
 */
const REQUEST_TIMEOUT_MS = 15_000;

interface SessionContextValue {
  /** localStorage を読む useEffect が走った後か。false の間は認証状態が確定していない */
  mounted: boolean;
  token: string | null;
  user: User | null;
  /** バックエンド起動待ちでリトライ中か。表示は SessionProvider が行う */
  apiWaiting: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  /** プロフィール更新など、トークンはそのままでユーザー情報だけ差し替える時に使う */
  updateUser: (user: User) => void;
  /**
   * レスポンスの形は呼び出し側にしか分からないので、型引数で受け取る。
   * 省略時は unknown なので、中身を読むなら `apiCall<User[]>('/api/friends')` のように
   * 呼び出し側で明示すること（誤った形を書いた場合はそこが唯一の嘘になる）。
   */
  apiCall: <T = unknown>(endpoint: string, method?: string, body?: unknown) => Promise<T>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession は SessionProvider の内側でのみ使えます');
  }
  return ctx;
}

/**
 * ログイン状態と API 呼び出しを全ページで共有する。
 * ページ単位で持つと遷移のたびに認証状態が作り直されるため、layout に置く。
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [apiWaiting, setApiWaiting] = useState(false);

  /** apiCall の関数としての同一性を保つため、token は ref 経由で読む */
  const tokenRef = useRef<string | null>(null);

  /*
   * localStorage はサーバー側に存在しないため、初回レンダリングでは必ず未ログインとして
   * 描き、ハイドレーション後にこの effect で本当の値へ差し替える（先に読むと
   * サーバーの出力と食い違ってハイドレーションエラーになる）。
   * mounted はその差し替えが済んだかどうかで、値が確定するまで各ページは待つ。
   *
   * ルールが想定する書き方にするなら localStorage を useSyncExternalStore の
   * 外部ストアとして購読する形になるが、認証の中核を丸ごと置き換えることになるため
   * ここでは従来どおりにしている。
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const storedToken = localStorage.getItem('ft_token');
    const storedUser = localStorage.getItem('ft_user');
    if (storedToken && storedUser) {
      tokenRef.current = storedToken;
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('ft_token', newToken);
    localStorage.setItem('ft_user', JSON.stringify(newUser));
    tokenRef.current = newToken;
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    sessionStorage.removeItem('ito_player_name');
    tokenRef.current = null;
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((next: User) => {
    localStorage.setItem('ft_user', JSON.stringify(next));
    setUser(next);
  }, []);

  const apiCall = useCallback(
    async <T = unknown,>(endpoint: string, method = 'GET', body?: unknown): Promise<T> => {
      const activeToken = tokenRef.current ?? localStorage.getItem('ft_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const deadline = Date.now() + API_RETRY_DEADLINE_MS;

      for (let attempt = 0; ; attempt++) {
        if (attempt > 0) {
          if (Date.now() >= deadline) break;
          setApiWaiting(true);
          // 指数バックオフ（上限あり）。締め切りを超えないよう待ち時間を切り詰める
          const delay = Math.min(
            API_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
            API_RETRY_MAX_DELAY_MS,
            deadline - Date.now(),
          );
          await new Promise(r => setTimeout(r, delay));
        }

        let res: Response;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
          res = await fetch(endpoint, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });
        } catch {
          // タイムアウトでの中断はリクエストがサーバーに届いている可能性があるため、
          // 副作用の二重実行を避けてリトライせず打ち切る
          if (controller.signal.aborted) {
            setApiWaiting(false);
            throw new Error(
              'サーバーからの応答がありません。時間をおいて再度お試しください。',
            );
          }
          // fetch自体が失敗＝サーバーに届いていないので、副作用の二重実行にはならない
          continue;
        } finally {
          clearTimeout(timer);
        }

        // 502/503 はnginxがバックエンドに到達できなかった状態。リクエストは処理されていない。
        // 504（Gateway Timeout）は処理済みの可能性があるため、あえてリトライしない
        if (res.status === 502 || res.status === 503) continue;

        setApiWaiting(false);

        if (!res.ok) {
          if (res.status === 401) {
            logout();
          }
          // NestJS の ValidationPipe は message を配列で返す（項目ごとのエラー）
          const errorData: { message?: string | string[] } = await res
            .json()
            .catch(() => ({}));
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(' / ')
            : errorData.message;
          throw new Error(message || 'エラーが発生しました');
        }
        return (await res.json()) as T;
      }

      setApiWaiting(false);
      throw new Error(
        'サーバーに接続できません。起動中の可能性があるため、少し待ってから再度お試しください。',
      );
    },
    [logout],
  );

  return (
    <SessionContext.Provider
      value={{ mounted, token, user, apiWaiting, login, logout, updateUser, apiCall }}
    >
      {/* バックエンド起動待ちの表示。make up 直後の502をリトライで吸収している間に出る */}
      {apiWaiting && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 bg-zinc-900/95 border border-indigo-800/60 rounded-full shadow-xl">
          <span className="h-3 w-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></span>
          <span className="text-[11px] font-semibold text-zinc-300">
            サーバーの起動を待っています…
          </span>
        </div>
      )}
      {children}
    </SessionContext.Provider>
  );
}
