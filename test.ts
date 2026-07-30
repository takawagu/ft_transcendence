import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function generateImage(prompt: string, outputPath: string): Promise<void> {
  const encodedPrompt = encodeURIComponent(prompt);
  
  // Pollinations AI の高品質画像生成エンドポイント（モデル: flux）
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true`;

  try {
    console.log(`\nAI画像を生成中: "${prompt}"...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTPエラー! status: ${response.status}`);
    }

    // 画像データを ArrayBuffer として取得して Buffer に変換
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ファイルに書き込み
    await fs.promises.writeFile(outputPath, buffer);
    console.log(`✨ 画像を正常に保存しました: ${outputPath}`);
  } catch (error) {
    console.error('❌ 画像生成に失敗しました:', error);
  }
}

async function main() {
  const prompt = await askQuestion('画像生成のプロンプトを入力してください: ');
  
  if (!prompt.trim()) {
    console.log('プロンプトが入力されませんでした。処理を終了します。');
    rl.close();
    return;
  }

  const trimmedPrompt = prompt.trim();

  // 'jpg' ディレクトリが存在しない場合は再帰的に作成
  await fs.promises.mkdir('jpg', { recursive: true });

  // ファイル名として安全な文字列にサニタイズ（禁止文字やスペースをアンダースコアに変換）
  const sanitizedPrompt = trimmedPrompt
    .replace(/[\/\\?%*:|"<>\s]/g, '_')
    .substring(0, 100); // ファイル名が長くなりすぎないように100文字に制限

  const outputPath = path.join('jpg', `${sanitizedPrompt}.jpg`);
  
  await generateImage(trimmedPrompt, outputPath);
  rl.close();
}

main();