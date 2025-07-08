import { Router } from 'express';
import path from 'path';

const router = Router();

// 静的ファイルの配信は index.ts で行うため、SPA用のcatch-allルートのみ定義
const staticDir = path.resolve(__dirname, '../../dist-src');

// ルート以外は index.html を返す（SPA 対応）
router.get(/^\/((?!api).)*/, (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

export default router;
