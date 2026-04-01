import { useState, useEffect, useCallback } from 'react';

// NOTE: This component is NOT used in Science and Fun app
// Science and Fun uses ScienceAndFun.jsx which uses apiService.js
// This file is kept for reference only

const PW_BASE = ''; // Removed hardcoded URL - configure via Admin Panel

const GRADIENTS = [
  'from-violet-500 to-purple-700', 'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',     'from-yellow-500 to-amber-600',
  'from-indigo-500 to-blue-700',   'from-teal-500 to-green-600',
  'from-red-500 to-pink-600',      'from-cyan-500 to-blue-500',
];

// ─── API ──────────────────────────────────────────────────────────────────────

const apiFetch = async (path, opts = {}) => {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

const getBatches = () => apiFetch('/api/pw/batches');

const getBatchDetails = (batchId) =>
  apiFetch(`/api/pw/batchdetails?batchId=${batchId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ searchParams: { BatchId: batchId } }),
  });

const getTopics = (batchId, subjectId) =>
  apiFetch(`/api/pw/topics?BatchId=${batchId}&SubjectId=${subjectId}`);

const getContent = (batchId, subjectSlug, topicSlug, contentType) =>
  apiFetch(`/api/pw/datacontent?batchId=${batchId}&subjectSlug=${subjectSlug}&topicSlug=${topicSlug}&contentType=${contentType}`);

const getVideoUrl = async (batchId, subjectId, findKey) => {
  const apis = [
    `/api/pw/videonew?batchId=${batchId}&subjectId=${subjectId}&childId=${findKey}`,
    `/api/pw/video?batchId=${batchId}&subjectId=${subjectId}&childId=${findKey}`,
    `/api/pw/videosuper?batchId=${batchId}&childId=${findKey}`,
    `/api/pw/videoplay?batchId=${batchId}&childId=${findKey}`,
  ];
  for (const api of apis) {
    try {
      const data = await apiFetch(api);
      const url = data?.url || data?.videoUrl || data?.playbackUrl ||
        data?.data?.url || data?.data?.videoUrl || data?.hlsUrl;
      if (url) return { url, data };
    } catch (_) {}
  }
  return null;
};

const getPdfUrl = async (batchId, subjectId, scheduleId) => {
  const apis = [
    `/api/pw/attachments-url?BatchId=${batchId}&SubjectId=${subjectId}&ContentId=${scheduleId}`,
    `/api/pw/attachment-link?batchId=${batchId}&subjectId=${subjectId}&scheduleId=${scheduleId}`,
  ];
  for (const api of apis) {
    try {
      const data = await apiFetch(api);
      const url = data?.url || data?.pdfUrl || data?.attachmentUrl || data?.link || data?.data?.url;
      if (url) return url;
    } catch (_) {}
  }
  return null;
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-orange-200 border-t-orange-500" />
  </div>
);

const ErrorBox = ({ msg, onRetry }) => (
  <div className="flex flex-col items-center py-12 gap-3 text-center">
    <div className="text-5xl">😵</div>
    <p className="text-red-500 text-sm max-w-xs">{msg}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-xl transition">
        Retry
      </button>
    )}
  </div>
);

const Empty = ({ text }) => (
  <div className="text-center py-16 text-gray-400">
    <div className="text-5xl mb-3">📭</div>
    <p className="font-medium">{text}</p>
  </div>
);

const Breadcrumb = ({ trail }) => (
  <div className="flex items-center gap-1.5 flex-wrap mb-5 text-xs">
    {trail.map((item, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span className="text-gray-300">›</span>}
        {item.onClick ? (
          <button onClick={item.onClick} className="text-orange-500 hover:text-orange-600 font-medium transition">
            {item.label}
          </button>
        ) : (
          <span className="text-gray-700 font-semibold">{item.label}</span>
        )}
      </span>
    ))}
  </div>
);

// ─── Video Modal ──────────────────────────────────────────────────────────────

const VideoModal = ({ video, batchId, subjectId, isLive, onClose }) => {
  const [state, setState] = useState({ loading: true, url: null, drmUrl: null, error: null });
  const findKey = video.findKey || video.videoDetails?.findKey || video._id || video.id;
  const title = video.title || video.topic || video.name || 'Video';

  useEffect(() => {
    const load = async () => {
      if (isLive) {
        return setState({ loading: false, url: null, drmUrl: `/pw/aws/play?video_id=${findKey}`, error: null });
      }
      const result = await getVideoUrl(batchId, subjectId, findKey);
      if (!result) {
        return setState({ loading: false, url: null, drmUrl: `/pw/drm/play?video_id=${findKey}&subject_slug=${subjectId}&batch_id=${batchId}`, error: null });
      }
      const { url, data } = result;
      const isDRM = url.includes('drm') || url.includes('encrypted') || data?.isDRM || data?.drm;
      if (isDRM) {
        setState({ loading: false, url: null, drmUrl: `/pw/drm/play?video_id=${findKey}&subject_slug=${subjectId}&batch_id=${batchId}`, error: null });
      } else {
        setState({ loading: false, url, drmUrl: null, error: null });
      }
    };
    load();
  }, [findKey, batchId, subjectId, isLive]);

  const { loading, url, drmUrl, error } = state;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-gray-950 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span>{isLive ? '📡' : '🎥'}</span>
            <p className="text-white text-sm font-medium truncate">{title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none ml-3 flex-shrink-0">×</button>
        </div>
        <div className="aspect-video bg-black flex items-center justify-center">
          {loading && <Spinner />}
          {error && <ErrorBox msg={error} />}
          {!loading && !error && drmUrl && (
            <div className="text-center text-white p-8 space-y-5">
              <div className="text-6xl">{isLive ? '📡' : '🔐'}</div>
              <p className="text-gray-300">{isLive ? 'Live Class' : 'DRM Protected Video'}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href={drmUrl} target="_blank" rel="noreferrer"
                  className="px-7 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-sm transition">
                  ▶ Open Player
                </a>
                {!isLive && (
                  <a href={`/pw/drm/apple/play?video_id=${findKey}`} target="_blank" rel="noreferrer"
                    className="px-7 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-sm transition">
                     Apple Player
                  </a>
                )}
              </div>
            </div>
          )}
          {!loading && !error && url && (
            <video src={url} controls autoPlay className="w-full h-full" controlsList="nodownload" />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PDF Modal ────────────────────────────────────────────────────────────────

const PdfModal = ({ item, batchId, subjectId, onClose }) => {
  const [state, setState] = useState({ loading: true, url: null, error: null });

  useEffect(() => {
    const load = async () => {
      const direct = item.url || item.pdfUrl || item.attachmentUrl || item.link || item.fileUrl;
      if (direct) return setState({ loading: false, url: direct, error: null });
      const scheduleId = item.scheduleId || item._id || item.id;
      const url = await getPdfUrl(batchId, subjectId, scheduleId);
      if (url) setState({ loading: false, url, error: null });
      else setState({ loading: false, url: null, error: 'PDF URL nahi mila' });
    };
    load();
  }, [item, batchId, subjectId]);

  const { loading, url, error } = state;
  const name = encodeURIComponent((item.title || item.name || 'document') + '.pdf');
  const viewUrl = url ? `/api/pw/view?url=${encodeURIComponent(url)}&filename=${name}` : null;
  const dlUrl = url ? `/api/pw/download?url=${encodeURIComponent(url)}&filename=${name}` : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span>📄</span>
            <p className="font-semibold text-gray-800 text-sm truncate">{item.title || item.name}</p>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {dlUrl && <a href={dlUrl} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-medium transition">⬇ Download</a>}
            {url && <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition">🔗 Open</a>}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {loading && <Spinner />}
          {error && <ErrorBox msg={error} />}
          {!loading && !error && viewUrl && <iframe src={viewUrl} className="w-full h-full border-0" title={item.title} />}
        </div>
      </div>
    </div>
  );
};

// ─── Content View ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'videos', label: '🎥 Lectures', active: 'bg-blue-500 text-white',    badge: 'bg-blue-100 text-blue-600',    icon: 'bg-blue-50 text-blue-500' },
  { key: 'notes',  label: '📄 Notes',    active: 'bg-emerald-500 text-white', badge: 'bg-emerald-100 text-emerald-600', icon: 'bg-emerald-50 text-emerald-500' },
  { key: 'dpp',    label: '📝 DPP',      active: 'bg-purple-500 text-white',  badge: 'bg-purple-100 text-purple-600',  icon: 'bg-purple-50 text-purple-500' },
];

const ContentView = ({ batchId, subject, topic, trail, onBack }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const subjectId = subject.slug || subject.subjectSlug || subject._id || subject.id;
  const topicSlug = topic.slug || topic.topicSlug || topic._id || topic.id;

  const load = useCallback(async (type) => {
    setLoading(true); setError(''); setItems([]);
    try {
      const data = await getContent(batchId, subjectId, topicSlug, type);
      const list = data?.data || data?.content || data?.items || data?.result || data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [batchId, subjectId, topicSlug]);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  const tab = TABS.find(t => t.key === activeTab);

  return (
    <div>
      <Breadcrumb trail={[...trail, { label: topic.name || topic.title }]} />
      <div className="flex items-start gap-3 mb-5 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">📖</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide">Chapter</p>
          <p className="font-bold text-gray-800">{topic.name || topic.title}</p>
          <div className="flex gap-3 mt-1 flex-wrap">
            {topic.videoCount > 0 && <span className="text-xs text-gray-400">🎥 {topic.videoCount}</span>}
            {topic.notesCount > 0 && <span className="text-xs text-gray-400">📄 {topic.notesCount}</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.key ? t.active + ' shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {error && <ErrorBox msg={error} onRetry={() => load(activeTab)} />}
      {!loading && !error && items.length === 0 && <Empty text={`Is chapter mein ${activeTab} nahi hai`} />}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const title = item.title || item.topic || item.name || `Item ${idx + 1}`;
            const isVideo = activeTab === 'videos';
            const thumb = item.thumbnail || item.image || item.imageUrl;
            const findKey = item.findKey || item._id || item.id;
            return (
              <div key={findKey || idx} onClick={() => isVideo ? setSelectedVideo(item) : setSelectedPdf(item)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md cursor-pointer transition-all group">
                {isVideo && thumb ? (
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={thumb} alt={title} className="w-full h-full object-cover"
                      onError={e => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl">🎥</div>'; }} />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${tab.icon}`}>
                    {isVideo ? '🎥' : activeTab === 'notes' ? '📄' : '📝'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-orange-600 transition-colors">{title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {item.duration && <span className="text-xs text-gray-400">⏱ {item.duration}</span>}
                    {item.date && <span className="text-xs text-gray-400">📅 {item.date}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-medium ${tab.badge}`}>
                  {isVideo ? '▶ Watch' : '👁 View'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selectedVideo && <VideoModal video={selectedVideo} batchId={batchId} subjectId={subjectId} isLive={false} onClose={() => setSelectedVideo(null)} />}
      {selectedPdf && <PdfModal item={selectedPdf} batchId={batchId} subjectId={subjectId} onClose={() => setSelectedPdf(null)} />}
    </div>
  );
};

// ─── Topics View ──────────────────────────────────────────────────────────────

const TopicsView = ({ batchId, subject, trail, onBack }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [search, setSearch] = useState('');

  const subjectId = subject.subjectId || subject._id || subject.id;
  const subjectSlug = subject.slug || subject.subjectSlug;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // Try subjectId first, then slug
      let data = null;
      for (const id of [subjectId, subjectSlug]) {
        if (!id) continue;
        try {
          data = await getTopics(batchId, id);
          const list = data?.data || data?.topics || data?.result || data || [];
          if (Array.isArray(list) && list.length > 0) {
            setTopics(list);
            setLoading(false);
            return;
          }
        } catch (_) {}
      }
      setTopics([]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [batchId, subjectId, subjectSlug]);

  useEffect(() => { load(); }, [load]);

  if (selectedTopic) {
    return (
      <ContentView
        batchId={batchId}
        subject={subject}
        topic={selectedTopic}
        trail={[...trail, { label: subject.name || subject.subject || subject.title, onClick: () => setSelectedTopic(null) }]}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  const filtered = topics.filter(t => (t.name || t.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Breadcrumb trail={[...trail, { label: subject.subject || subject.name || subject.title }]} />
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-gray-100">
          {subject.icon ? (
            <img src={subject.icon} alt={subject.subject} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl">📚</div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Subject</p>
          <h2 className="text-xl font-bold text-gray-900">{subject.subject || subject.name || subject.title}</h2>
          {subject.lectureCount > 0 && <p className="text-xs text-gray-400">{subject.lectureCount} lectures</p>}
        </div>
      </div>

      {topics.length > 5 && (
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Chapter search karo..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50" />
        </div>
      )}

      {loading && <Spinner />}
      {error && <ErrorBox msg={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-medium mb-2">Topics load nahi hue</p>
          <p className="text-xs text-gray-400 mb-4">Server pe topics endpoint available nahi hai</p>
          <a
            href={`https://www.pw.live/study`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-xl font-medium transition"
          >
            🌐 PW Website pe dekho
          </a>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((topic, idx) => (
            <div key={topic.id || topic._id || idx} onClick={() => setSelectedTopic(topic)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-300 hover:shadow-md cursor-pointer transition-all group">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-orange-600 transition-colors leading-snug">{topic.name || topic.title}</p>
                <div className="flex gap-3 mt-0.5">
                  {topic.videoCount > 0 && <span className="text-xs text-gray-400">🎥 {topic.videoCount}</span>}
                  {topic.notesCount > 0 && <span className="text-xs text-gray-400">📄 {topic.notesCount}</span>}
                </div>
              </div>
              <span className="text-gray-300 group-hover:text-orange-400 transition-colors text-xl">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Subjects View ────────────────────────────────────────────────────────────

const SubjectsView = ({ batchId, batch, subjects, trail, onBack }) => {
  const [selected, setSelected] = useState(null);

  const batchTitle = batch?.batchName || batch?.title || batch?.name || `Batch ${batchId}`;
  const batchThumb = batch?.batchImage || batch?.image || batch?.thumbnail;

  if (selected) {
    return (
      <TopicsView
        batchId={batchId}
        subject={selected}
        trail={[...trail, { label: batchTitle, onClick: () => setSelected(null) }]}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div>
      <Breadcrumb trail={[...trail, { label: batchTitle }]} />

      {/* Batch banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-orange-500 to-red-600 p-5 text-white shadow-lg min-h-[110px]">
        {batchThumb && (
          <img src={batchThumb} alt={batchTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            onError={e => { e.target.style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/60 to-red-700/60" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">Batch</p>
          <h2 className="text-2xl font-bold leading-tight">{batchTitle}</h2>
          <p className="text-xs text-orange-200 mt-1 font-mono opacity-70">ID: {batchId}</p>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
        📚 Subjects ({subjects.filter(s => s.subject !== 'Notices').length})
      </h3>

      {subjects.length === 0 ? (
        <Empty text="Is batch mein koi subject nahi mila" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {subjects
            .filter(s => s.subject !== 'Notices')
            .map((sub, idx) => (
              <div key={sub._id || sub.id || idx} onClick={() => setSelected(sub)}
                className={`bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} p-5 rounded-2xl text-white cursor-pointer hover:scale-[1.04] hover:shadow-xl transition-all shadow-md`}>
                {sub.icon ? (
                  <img src={sub.icon} alt={sub.subject} className="w-10 h-10 rounded-lg object-cover mb-3 bg-white/20"
                    onError={e => { e.target.style.display='none'; }} />
                ) : (
                  <div className="text-3xl mb-3">📚</div>
                )}
                <p className="font-bold text-sm leading-tight">{sub.subject || sub.name || sub.title}</p>
                {sub.lectureCount > 0 && (
                  <p className="text-xs mt-1 text-white/70">{sub.lectureCount} lectures</p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

// ─── Batches Grid ─────────────────────────────────────────────────────────────

const BatchesGrid = ({ onSelect }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getBatches();
      const list = data?.data || data?.batches || data?.result || data?.courses || data || [];
      setBatches(Array.isArray(list) ? list : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = batches.filter(b =>
    (b.batchName || b.title || b.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl text-3xl shadow-lg mb-4">⚡</div>
        <h2 className="text-2xl font-bold text-gray-900">Physics Wallah</h2>
        <p className="text-gray-500 text-sm mt-1">
          {batches.length > 0 ? `${batches.length} batches available` : 'Loading...'}
        </p>
      </div>

      {batches.length > 0 && (
        <div className="relative mb-6 max-w-md mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${batches.length} batches...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50" />
        </div>
      )}

      {loading && <Spinner />}
      {error && <ErrorBox msg={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <Empty text="Koi batch nahi mila" />}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((batch, idx) => {
            const title = batch.batchName || batch.title || batch.name || `Batch ${idx + 1}`;
            const thumb = batch.batchImage || batch.image || batch.thumbnail;
            const id = batch.batchId || batch.id || batch._id;
            return (
              <div key={id || idx} onClick={() => onSelect(id, batch)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 cursor-pointer transition-all hover:-translate-y-1">
                <div className="relative h-32 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-white/80">📚</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-medium">PW</div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-xs leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">{title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[80px]">{String(id).slice(-8)}</span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium group-hover:bg-orange-500 group-hover:text-white transition-colors flex-shrink-0">
                      Open →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const PhysicsWallah = () => {
  const [view, setView] = useState({ screen: 'batches', batchId: null, batch: null, subjects: [] });
  const [loadingBatch, setLoadingBatch] = useState(false);

  const goHome = () => setView({ screen: 'batches', batchId: null, batch: null, subjects: [] });

  const handleBatchSelect = async (batchId, batch) => {
    setLoadingBatch(true);
    let subjects = [];
    try {
      const data = await getBatchDetails(batchId);
      subjects = data?.data?.subjects || data?.subjects || [];
    } catch (_) {}
    setLoadingBatch(false);
    setView({ screen: 'subjects', batchId, batch, subjects });
  };

  const batchTitle = view.batch?.batchName || view.batch?.title || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={goHome} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold shadow hover:scale-105 transition-transform">
            ⚡
          </button>
          <span className="font-bold text-gray-900">Physics Wallah</span>
          {batchTitle && (
            <span className="text-gray-400 text-xs ml-auto truncate max-w-[200px]">{batchTitle}</span>
          )}
        </div>
      </div>

      {loadingBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-orange-200 border-t-orange-500" />
            <p className="text-gray-700 font-semibold">Batch load ho raha hai...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
          {view.screen === 'batches' && <BatchesGrid onSelect={handleBatchSelect} />}
          {view.screen === 'subjects' && (
            <SubjectsView
              batchId={view.batchId}
              batch={view.batch}
              subjects={view.subjects}
              trail={[{ label: '⚡ PW', onClick: goHome }]}
              onBack={goHome}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PhysicsWallah;
