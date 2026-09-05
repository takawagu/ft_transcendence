/**
 * プロフィールアイコンの描画。
 * 絵文字プリセットと画像URLのどちらも `User.profileImage` の1カラムに入るため、
 * 中身を見て出し分ける。ホーム画面と /messages で同じ見た目にするために共有する。
 */
export function renderAvatar(
  avatar: string | undefined,
  sizeClass = 'w-10 h-10 text-xl',
) {
  if (!avatar) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 overflow-hidden shrink-0`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[60%] h-[60%]"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }
  if (avatar.length <= 4 && /\p{Emoji}/u.test(avatar)) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-zinc-850 flex items-center justify-center border border-zinc-700 shadow-inner`}
      >
        {avatar}
      </div>
    );
  }
  return (
    <img
      src={avatar}
      alt="avatar"
      className={`${sizeClass} rounded-full object-cover border border-zinc-700`}
      onError={e => {
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  );
}
