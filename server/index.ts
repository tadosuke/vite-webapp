import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルの配信ディレクトリ
const staticDir = path.resolve(
  fileURLToPath(new URL('../dist-src', import.meta.url)),
);

app.use(express.static(staticDir));
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
