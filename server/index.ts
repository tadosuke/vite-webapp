import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルの配信ディレクトリ
const staticDir = path.resolve(__dirname, '../dist-src');

app.use(express.static(staticDir));
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
