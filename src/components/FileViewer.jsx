import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const IMG = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'];
const VID = ['mp4', 'webm', 'mov', 'm4v', 'ogv'];
const AUD = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'oga', 'opus', 'weba'];
const ext = (n) => (/\.([a-z0-9]+)(?:[?#].*)?$/i.exec(String(n || '')) || [])[1]?.toLowerCase() || '';

/**
 * Light full-screen file viewer: images, video, audio, PDF and a download card for anything else.
 * files = [{ id, original_name, url, size_human?, uploader_name? }]
 */
export default function FileViewer({ files = [], startIndex = 0, locale = 'en', onClose }) {
  const [i, setI] = useState(Math.min(Math.max(0, startIndex), Math.max(0, files.length - 1)));
  const f = files[i];
  const next = useCallback(() => setI((v) => (v + 1) % files.length), [files.length]);
  const prev = useCallback(() => setI((v) => (v - 1 + files.length) % files.length), [files.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowRight') (document.dir === 'rtl' ? prev : next)();
      else if (e.key === 'ArrowLeft') (document.dir === 'rtl' ? next : prev)();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  if (!f) return null;
  const e = ext(f.original_name || f.url);
  let body;
  if (IMG.includes(e)) body = <img src={f.url} alt={f.original_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
  else if (VID.includes(e)) body = <video src={f.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />;
  else if (AUD.includes(e)) body = <audio src={f.url} controls autoPlay />;
  else if (e === 'pdf') body = <iframe title={f.original_name} src={f.url} style={{ width: '100%', height: '100%', border: 0, background: '#fff' }} />;
  else body = (
    <div style={{ textAlign: 'center', color: '#fff' }}>
      <Icon name="file" size={56} />
      <p style={{ fontWeight: 700 }}>{f.original_name}</p>
      <a className="btn btn-primary" href={f.url} download={f.original_name} target="_blank" rel="noreferrer">{locale === 'ar' ? 'تحميل' : 'Download'}</a>
    </div>
  );

  return createPortal(
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.88)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', color: '#fff' }}>
        <strong style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.original_name}</strong>
        {f.size_human && <span style={{ opacity: .7 }}>{f.size_human}</span>}
        <a href={f.url} download={f.original_name} target="_blank" rel="noreferrer" style={{ color: '#fff' }} aria-label="download"><Icon name="download" size={20} /></a>
        <button type="button" onClick={onClose} aria-label="close" style={{ background: 'none', border: 0, color: '#fff', cursor: 'pointer' }}><Icon name="x" size={22} /></button>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>{body}</div>
      {files.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: 10, color: '#fff' }}>
          <button type="button" onClick={prev} style={{ background: 'none', border: 0, color: '#fff', cursor: 'pointer' }}>‹</button>
          <span>{i + 1} / {files.length}</span>
          <button type="button" onClick={next} style={{ background: 'none', border: 0, color: '#fff', cursor: 'pointer' }}>›</button>
        </div>
      )}
    </div>,
    document.body,
  );
}
