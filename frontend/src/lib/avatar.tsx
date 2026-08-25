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
        className={`${sizeClass} rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold`}
      >
        ?
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
