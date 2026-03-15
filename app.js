/**
 * app.js
 * 道路判定マップ メインロジック
 * 依存: Leaflet, roads.js
 */

let userLat = 35.1815;   // デフォルト: 名古屋
let userLng = 136.9066;
let roadLayers = [];

/* ---- 地図初期化 ---- */
const map = L.map('map', { zoomControl: false }).setView([userLat, userLng], 15);

L.control.zoom({ position: 'topright' }).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
}).addTo(map);

const userMarker = L.circleMarker([userLat, userLng], {
  radius: 9,
  color: '#fff',
  fillColor: '#f97316',
  fillOpacity: 1,
  weight: 3,
}).addTo(map).bindPopup('現在地');

/* ---- UI ユーティリティ ---- */
function showLoader(text) {
  document.getElementById('loader-text').textContent = text || 'データ取得中...';
  document.getElementById('loader').classList.add('show');
}

function hideLoader() {
  document.getElementById('loader').classList.remove('show');
}

function setStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = type || '';
}

/* ---- Overpass API ---- */
async function overpassFetch(query) {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ---- 道路レンダリング ---- */
function renderWays(elements) {
  const nodes = {};
  elements.filter(e => e.type === 'node').forEach(n => {
    nodes[n.id] = [n.lat, n.lon];
  });

  const counts = { public: 0, caution: 0, ng: 0 };

  elements.filter(e => e.type === 'way').forEach(way => {
    const tags  = way.tags || {};
    const info  = getRoadInfo(tags);
    if (!info) return;

    const coords = (way.nodes || []).map(id => nodes[id]).filter(Boolean);
    if (coords.length < 2) return;

    counts[info.cat]++;

    const line = L.polyline(coords, {
      color:   CAT_COLOR[info.cat],
      weight:  info.weight,
      opacity: CAT_OPACITY[info.cat],
    }).addTo(map);

    const name = tags.name || tags['name:ja'] || '名称不明';
    const noteHtml = info.note
      ? `<div class="road-popup-note">${info.note}</div>`
      : '';

    line.bindPopup(`
      <span class="road-popup-name">${name}</span>
      <div class="road-popup-type">種別：${info.label}</div>
      ${badgeHtml(info.cat)}
      ${noteHtml}
    `);

    roadLayers.push(line);
  });

  return counts;
}

/* ---- 道路読み込み ---- */
async function fetchRoads() {
  roadLayers.forEach(l => map.removeLayer(l));
  roadLayers = [];

  showLoader('周辺の道路データを取得中...');
  setStatus('取得中...', 'loading');

  const query = `[out:json][timeout:25];
(way["highway"](around:500,${userLat},${userLng}););
out body;>;out skel qt;`;

  try {
    const data   = await overpassFetch(query);
    const counts = renderWays(data.elements);
    const total  = counts.public + counts.caution + counts.ng;

    setStatus(
      `${total}本表示　公道 ${counts.public}本 ／ 要注意 ${counts.caution}本 ／ 通行不可の可能性 ${counts.ng}本`,
      'ok'
    );
  } catch (err) {
    console.error(err);
    setStatus('取得失敗。インターネット接続を確認してください。', 'error');
  }

  hideLoader();
}

/* ---- 現在地取得 ---- */
function getLocation() {
  if (!navigator.geolocation) {
    setStatus('この端末では位置情報が使えません', 'error');
    return;
  }

  setStatus('位置情報を取得中...', 'loading');

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      map.setView([userLat, userLng], 16);
      userMarker.setLatLng([userLat, userLng]);
      setStatus('現在地を取得しました', 'ok');
      fetchRoads();
    },
    () => {
      setStatus('位置情報の取得に失敗しました', 'error');
    }
  );
}

/* ---- 起動時に読み込む ---- */
fetchRoads();
