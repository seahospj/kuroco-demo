// VITE_API_BASE_URL がなければ開発時は /api プロキシ経由で叩く
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

// デモ用静的トークン: 本番では必ず安全に管理してください
export const API_TOKEN =
  import.meta.env.VITE_API_TOKEN || 'cc94b69e011cf9128c98f3c90946bd8e1a6f022ebb6fdbf65f50a81cb3152946';

// 記事のコンテンツ定義ID。必要に応じて変更してください
export const TOPICS_GROUP_ID = 1;

export const PAGE_SIZE = 12;

