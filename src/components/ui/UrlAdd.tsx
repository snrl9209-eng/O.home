'use client';
// 이미지 링크(URL)로 추가 — 공용 미니 위젯
// 바이트를 직접 받아오지 않고 <img> 로딩만 검사한다. 그래서 다른 사이트가
// fetch/다운로드를 막아둬도(CORS) 문제없이 동작한다 — 화면에 보이면 그대로 쓸 수 있다.
import React, { useState } from 'react';
import { KInput } from './Kit';

export function UrlAdd({ onAdd, placeholder }: { onAdd: (url: string) => void; placeholder?: string }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const check = () => {
    const u = url.trim();
    if (!u) return;
    setBusy(true);
    setErr(null);
    const img = new window.Image();
    img.onload = () => { setBusy(false); onAdd(u); setUrl(''); };
    img.onerror = () => { setBusy(false); setErr('이 링크에서는 이미지를 불러올 수 없어요. 주소를 다시 확인해 주세요.'); };
    img.src = u;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        <KInput
          type="text"
          placeholder={placeholder ?? '이미지 링크(URL) 붙여넣기'}
          value={url}
          onChange={e => { setUrl(e.target.value); setErr(null); }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); check(); } }}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-ghost" disabled={busy || !url.trim()} onClick={check}>
          {busy ? '확인 중…' : '추가'}
        </button>
      </div>
      {err && <div style={{ color: '#d33', fontSize: 12, marginTop: 4 }}>{err}</div>}
    </div>
  );
}
