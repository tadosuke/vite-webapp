import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルの配信ディレクトリ
const staticDir = path.resolve(__dirname, "../dist");

app.use(express.static(staticDir));

// ルート以外は index.html を返す（SPA 対応）
// ワイルドカードを正規表現に変更
app.get(/^\/((?!api).)*/, (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
