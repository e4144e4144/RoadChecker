/**
 * roads.js
 * 道路種別の定義と判定ロジック
 *
 * 3カテゴリで分類：
 *   public  → 青：公道（車で通れる）
 *   caution → 黄：要注意（車幅が狭い・生活道路など）
 *   ng      → 赤：通行不可の可能性（私道・歩行者専用・自転車専用・河川敷など）
 */

const ROAD_DEFS = {
  // === 公道（車で通れる）===
  motorway:      { label: '高速道路',     cat: 'public',  weight: 6 },
  trunk:         { label: '幹線道路',     cat: 'public',  weight: 5 },
  primary:       { label: '主要道路',     cat: 'public',  weight: 5 },
  secondary:     { label: '二次道路',     cat: 'public',  weight: 4 },
  tertiary:      { label: '三次道路',     cat: 'public',  weight: 3 },

  // === 要注意（狭い・生活道路）===
  residential:   { label: '住宅地道路',   cat: 'caution', weight: 3 },
  living_street: { label: '生活道路',     cat: 'caution', weight: 2 },
  unclassified:  { label: '未分類道路',   cat: 'caution', weight: 2 },

  // === 通行不可の可能性 ===
  // 私道・業務用
  service:       { label: 'サービス道路（私道の可能性）', cat: 'ng', weight: 2 },
  track:         { label: '農道・林道',                  cat: 'ng', weight: 2 },
  // 歩行者・自転車専用
  footway:       { label: '歩道・歩行者専用',             cat: 'ng', weight: 2 },
  path:          { label: '小道・歩行者専用',             cat: 'ng', weight: 1.5 },
  cycleway:      { label: '自転車専用道路',               cat: 'ng', weight: 2 },
  pedestrian:    { label: '歩行者専用道路',               cat: 'ng', weight: 2 },
  steps:         { label: '階段',                         cat: 'ng', weight: 1.5 },
  // 河川敷・公園内
  bridleway:     { label: '乗馬・河川敷道路',             cat: 'ng', weight: 1.5 },
};

/** カテゴリごとの色 */
const CAT_COLOR = {
  public:  '#2563eb',  // 青
  caution: '#f59e0b',  // 黄
  ng:      '#ef4444',  // 赤
};

/** カテゴリごとの不透明度 */
const CAT_OPACITY = {
  public:  0.85,
  caution: 0.85,
  ng:      0.85,
};

/**
 * OSMタグから判定結果を返す
 * @param {Object} tags
 * @returns {{ label, cat, weight, note } | null}
 */
function getRoadInfo(tags) {
  const hw = tags.highway;
  const def = ROAD_DEFS[hw];
  if (!def) return null;

  let cat   = def.cat;
  let label = def.label;
  let note  = '';

  // --- access タグによる補正 ---
  if (tags.access === 'private' || tags.access === 'no') {
    cat  = 'ng';
    note = '私道（access=private）';
  }
  if (tags.access === 'yes' || tags.access === 'public') {
    // 明示的に公開されている場合、ng→caution に緩和（歩行者専用等はそのまま）
    if (cat === 'ng' && (hw === 'service' || hw === 'track' || hw === 'unclassified')) {
      cat = 'caution';
    }
  }

  // --- service タグによる補正 ---
  if (hw === 'service') {
    if (tags.service === 'driveway' || tags.service === 'parking_aisle') {
      cat  = 'ng';
      note = '私有地内道路';
    } else if (tags.service === 'alley') {
      cat  = 'caution';
      note = '路地（狭い可能性あり）';
    }
  }

  // --- 幅員タグによる caution 判定 ---
  // width タグが存在して 3m 未満は要注意
  if (tags.width) {
    const w = parseFloat(tags.width);
    if (!isNaN(w) && w < 3.0 && cat === 'public') {
      cat  = 'caution';
      note = `車幅注意（幅 ${w}m）`;
    }
  }

  // --- lanes タグで1車線以下は caution ---
  if (tags.lanes && parseInt(tags.lanes) <= 1 && cat === 'public') {
    cat  = 'caution';
    note = '1車線（狭い可能性あり）';
  }

  // --- 河川敷・公園専用の追加チェック ---
  if (tags.bicycle === 'designated' && tags.foot === 'designated' && !tags.motor_vehicle) {
    cat  = 'ng';
    note = '自転車・歩行者専用';
  }
  if (tags.motor_vehicle === 'no' || tags.motorcar === 'no') {
    cat  = 'ng';
    note = '自動車通行不可';
  }

  return { label, cat, weight: def.weight, note };
}

/**
 * バッジHTML
 */
function badgeHtml(cat) {
  if (cat === 'public')  return '<span class="badge badge-public">✓ 公道</span>';
  if (cat === 'caution') return '<span class="badge badge-caution">⚠ 要注意（狭い道）</span>';
  return '<span class="badge badge-ng">✕ 通行不可の可能性</span>';
}
