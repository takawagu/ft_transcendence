/**
 * catch した値から、画面に出すメッセージを取り出す。
 *
 * strict の catch 変数は unknown なので、`err.message` は直接読めない。
 * apiCall が投げるのは必ず Error だが、fetch やライブラリの内部から
 * 文字列などが飛んでくる可能性は型の上では消せないため、Error かどうかを見る。
 *
 * message が空文字の Error もそのまま出すと無言のトーストになるので fallback へ倒す。
 */
export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
