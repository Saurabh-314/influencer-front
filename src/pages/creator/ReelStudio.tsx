import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    useCancelReelPost,
    useReelPosts,
    useRetryReelTarget,
    useSaveReelPost,
    useUploadReelMedia,
    type ReelPost,
    type ReelPostPayload,
} from '@/hooks/useReelPosts';
import {
    useConnectInstagram,
    useInstagramAccounts,
} from '@/hooks/useSocialAccounts';
import { accountAvatarStyle } from '@/components/creator/CreatorInstagramAccounts';
import { getApiErrorMessage } from '@/api/axios';
import { formatCount, type SocialAccountRecord } from '@/utils/creator';
import { formatFileSize, resolveAssetUrl } from '@/utils/image';
import {
    clearInstagramOAuthSearchParams,
    getInstagramOAuthErrorMessage,
} from '@/utils/socialAccounts';

const HASHTAG_SUGGESTIONS = ['#creator', '#reels', '#music', '#lifestyle', '#india', '#viral'];
const DEFAULT_TIMES = ['18:30', '12:15', '20:00'];

type AccountSchedule = {
    date: string;
    time: string;
    caption: string;
};

function pad(value: number) {
    return String(value).padStart(2, '0');
}

function istDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
    return {
        date: `${get('year')}-${get('month')}-${get('day')}`,
        time: `${get('hour')}:${get('minute')}`,
    };
}

function addIstDays(days: number) {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return istDateParts(now).date;
}

function toIstIso(date: string, time: string) {
    return `${date}T${time}:00+05:30`;
}

function isScheduleBeforeNow(date: string, time: string) {
    if (!date || !time) return true;
    const now = istDateParts();
    return toIstIso(date, time) < toIstIso(now.date, now.time);
}

function clampSchedule(date: string, time: string, caption = ''): AccountSchedule {
    if (!isScheduleBeforeNow(date, time)) return { date, time, caption };
    const now = istDateParts();
    return { date: now.date, time: now.time, caption };
}

function defaultSchedule(index: number, caption = ''): AccountSchedule {
    return clampSchedule(addIstDays(index), DEFAULT_TIMES[index % DEFAULT_TIMES.length], caption);
}

function formatIstLabel(iso?: string | null) {
    if (!iso) return '—';
    const value = new Date(iso);
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
        .format(value)
        .replace(',', ' ·');
}

function formatDuration(seconds?: number | null) {
    if (!seconds || !Number.isFinite(seconds)) return '0:00';
    const total = Math.max(0, Math.round(seconds));
    return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}

function accountRoleLabel(account: SocialAccountRecord, index: number) {
    if (index === 0) return 'Primary creator account';
    if (String(account.account_type || '').toUpperCase() === 'BUSINESS') return 'Brand / catalogue account';
    return 'Connected account';
}

function statusClass(status: string) {
    if (status === 'scheduled' || status === 'publishing' || status === 'processing') {
        return 'bg-[#eef5ff] text-[#47658e]';
    }
    if (status === 'published') return 'bg-[#eaf9f1] text-[#15945a]';
    if (status === 'failed') return 'bg-[#fff0f0] text-[#c23b3b]';
    return 'bg-[#f4f4f6] text-[#777a83]';
}

function queueStatus(post: ReelPost) {
    const statuses = (post.targets || []).filter((item) => item.enabled).map((item) => item.status);
    if (statuses.includes('processing') || post.status === 'publishing') return 'Publishing';
    if (statuses.includes('failed') || post.status === 'failed') return 'Failed';
    if (statuses.includes('scheduled') || post.status === 'scheduled') return 'Scheduled';
    if (statuses.every((status) => status === 'published') || post.status === 'published') return 'Published';
    if (post.status === 'cancelled') return 'Cancelled';
    return 'Draft';
}

async function readVideoMeta(file: File) {
    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = previewUrl;

    await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Could not read this video file'));
    });

    const duration = video.duration;
    const width = video.videoWidth;
    const height = video.videoHeight;
    video.currentTime = Math.min(0.5, Number.isFinite(duration) ? duration * 0.08 : 0.1);

    await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        setTimeout(resolve, 900);
    });

    const canvas = document.createElement('canvas');
    canvas.width = width || 1080;
    canvas.height = height || 1920;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const thumbnail = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.82);
    });

    return { previewUrl, duration, width, height, thumbnail };
}

export default function CreatorReelStudio() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { accounts } = useInstagramAccounts();
    const { mutate: connectInstagram, isPending: isConnecting } = useConnectInstagram('reel-studio');
    const { data: posts = [], isLoading: postsLoading } = useReelPosts();
    const uploadReel = useUploadReelMedia();
    const saveReel = useSaveReelPost();
    const cancelReel = useCancelReelPost();
    const retryTarget = useRetryReelTarget();
    const fileRef = useRef<HTMLInputElement>(null);
    const didInitAccounts = useRef(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [schedules, setSchedules] = useState<Record<string, AccountSchedule>>({});
    const [caption, setCaption] = useState('');
    const [hashtags, setHashtags] = useState<string[]>(['#creator', '#reels']);
    const [customTag, setCustomTag] = useState('');
    const [sameCaption, setSameCaption] = useState(true);
    const [suggestHashtags, setSuggestHashtags] = useState(true);
    const [addFirstComment, setAddFirstComment] = useState(false);
    const [firstComment, setFirstComment] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState<number | null>(null);
    const [duration, setDuration] = useState<number | null>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFilename, setVideoFilename] = useState('');
    const [videoMime, setVideoMime] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [dragging, setDragging] = useState(false);
    const [banner, setBanner] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const oauthError = getInstagramOAuthErrorMessage(
        searchParams.get('error'),
        searchParams.get('error_description'),
    );
    const oauthSuccess = searchParams.get('success') === 'connected';

    useEffect(() => {
        if (!oauthSuccess && !oauthError) return;
        if (oauthSuccess) setNotice('Instagram account connected. You can schedule this reel to it now.');
        if (oauthError) setBanner({ type: 'error', text: oauthError });
        clearInstagramOAuthSearchParams(searchParams);
        setSearchParams(searchParams, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [oauthSuccess, oauthError]);

    useEffect(() => {
        return () => {
            if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (!accounts.length || didInitAccounts.current) return;
        didInitAccounts.current = true;
        const first = String(accounts[0].id);
        setSelectedIds([first]);
        setSchedules((current) => ({
            ...current,
            [first]: current[first] || defaultSchedule(0),
        }));
    }, [accounts]);

    const selectedAccounts = useMemo(
        () => accounts.filter((account) => selectedIds.includes(String(account.id))),
        [accounts, selectedIds],
    );

    const nextPublish = useMemo(() => {
        const stamps = selectedAccounts
            .map((account) => schedules[String(account.id)])
            .filter((item) => item?.date && item?.time)
            .map((item) => new Date(toIstIso(item.date, item.time)).getTime())
            .sort((a, b) => a - b);
        return stamps[0] ? formatIstLabel(new Date(stamps[0]).toISOString()) : '—';
    }, [selectedAccounts, schedules]);

    const upcoming = useMemo(
        () => posts.filter((post) => post.status !== 'cancelled'),
        [posts],
    );

    function ensureSchedule(accountId: string, index: number) {
        setSchedules((current) => {
            if (current[accountId]) return current;
            return {
                ...current,
                [accountId]: defaultSchedule(index),
            };
        });
    }

    function updateSchedule(accountId: string, next: Partial<AccountSchedule>, current: AccountSchedule) {
        const merged = {
            date: next.date ?? current.date,
            time: next.time ?? current.time,
            caption: next.caption ?? current.caption,
        };
        const clamped = clampSchedule(merged.date, merged.time, merged.caption);
        if (isScheduleBeforeNow(merged.date, merged.time)) {
            setBanner({ type: 'error', text: 'Schedule date and time cannot be before the current date and time.' });
        }
        setSchedules((existing) => ({ ...existing, [accountId]: clamped }));
    }

    function toggleAccount(accountId: string, index: number) {
        setSelectedIds((current) => {
            if (current.includes(accountId)) {
                return current.filter((id) => id !== accountId);
            }
            ensureSchedule(accountId, index);
            return [...current, accountId];
        });
    }

    function selectAll() {
        const ids = accounts.map((account) => String(account.id));
        ids.forEach((id, index) => ensureSchedule(id, index));
        setSelectedIds(ids);
    }

    function resetComposer() {
        setEditingId(null);
        setCaption('');
        setHashtags(['#creator', '#reels']);
        setSameCaption(true);
        setSuggestHashtags(true);
        setAddFirstComment(false);
        setFirstComment('');
        setPreviewUrl('');
        setFileName('');
        setFileSize(null);
        setDuration(null);
        setDimensions(null);
        setVideoUrl('');
        setVideoFilename('');
        setVideoMime('');
        setThumbnailUrl('');
    }

    async function handleVideoFile(file: File) {
        const allowed = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
        if (!allowed.includes(file.type) && !/\.(mp4|mov|m4v)$/i.test(file.name)) {
            setBanner({ type: 'error', text: 'Upload an MP4 or MOV reel.' });
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            setBanner({ type: 'error', text: 'Reel files can be up to 100MB.' });
            return;
        }

        try {
            const meta = await readVideoMeta(file);
            setPreviewUrl(meta.previewUrl);
            setFileName(file.name);
            setFileSize(file.size);
            setDuration(meta.duration);
            setDimensions({ width: meta.width, height: meta.height });
            setBanner(null);

            const uploaded = await uploadReel.mutateAsync({
                file,
                thumbnail: meta.thumbnail,
                meta: {
                    duration_seconds: meta.duration,
                    width: meta.width,
                    height: meta.height,
                },
            });
            setVideoUrl(uploaded.video_url);
            setVideoFilename(uploaded.video_filename);
            setVideoMime(uploaded.video_mime || file.type);
            setThumbnailUrl(uploaded.thumbnail_url || '');
            setFileSize(uploaded.video_size || file.size);
            setDuration(uploaded.duration_seconds || meta.duration);
            if (uploaded.width && uploaded.height) {
                setDimensions({ width: uploaded.width, height: uploaded.height });
            }
        } catch (error) {
            setBanner({ type: 'error', text: getApiErrorMessage(error, 'Could not upload this reel') });
        }
    }

    function onDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) void handleVideoFile(file);
    }

    function addHashtag() {
        const next = customTag.trim();
        if (!next) return;
        const tag = next.startsWith('#') ? next : `#${next.replace(/^#+/, '')}`;
        if (!hashtags.includes(tag)) setHashtags((current) => [...current, tag]);
        setCustomTag('');
    }

    function buildPayload(status: 'draft' | 'scheduled'): ReelPostPayload {
        return {
            video_url: videoUrl,
            video_filename: videoFilename,
            original_filename: fileName,
            video_mime: videoMime,
            video_size: fileSize,
            duration_seconds: duration,
            width: dimensions?.width,
            height: dimensions?.height,
            thumbnail_url: thumbnailUrl,
            caption,
            hashtags,
            use_same_caption: sameCaption,
            suggest_hashtags: suggestHashtags,
            add_first_comment: addFirstComment,
            first_comment: firstComment,
            status,
            targets: accounts.map((account) => {
                const id = String(account.id);
                const schedule = schedules[id];
                const enabled = selectedIds.includes(id);
                return {
                    social_account_id: Number(account.id),
                    caption: sameCaption ? caption : (schedule?.caption || caption),
                    first_comment: firstComment,
                    scheduled_at: schedule ? toIstIso(schedule.date, schedule.time) : null,
                    enabled,
                };
            }),
        };
    }

    async function save(status: 'draft' | 'scheduled') {
        if (!videoUrl) {
            setBanner({ type: 'error', text: 'Upload a reel before saving or scheduling.' });
            return;
        }
        if (status === 'scheduled' && selectedIds.length === 0) {
            setBanner({ type: 'error', text: 'Choose at least one Instagram account.' });
            return;
        }
        if (status === 'scheduled') {
            const pastAccounts = selectedAccounts.filter((account) => {
                const schedule = schedules[String(account.id)];
                return !schedule || isScheduleBeforeNow(schedule.date, schedule.time);
            });
            if (pastAccounts.length) {
                setBanner({
                    type: 'error',
                    text: `Schedule date and time cannot be before now (${pastAccounts.map((account) => `@${account.username}`).join(', ')}).`,
                });
                return;
            }
        }
        try {
            await saveReel.mutateAsync({
                id: editingId || undefined,
                payload: buildPayload(status),
            });
            setBanner({
                type: 'ok',
                text: status === 'scheduled'
                    ? `Scheduled ${selectedIds.length} reel${selectedIds.length === 1 ? '' : 's'}.`
                    : 'Draft saved.',
            });
            if (status === 'scheduled') resetComposer();
        } catch (error) {
            setBanner({ type: 'error', text: getApiErrorMessage(error, 'Could not save this reel') });
        }
    }

    function loadPost(post: ReelPost) {
        setEditingId(post.id);
        setCaption(post.caption || '');
        setHashtags(post.hashtags?.length ? post.hashtags : ['#creator', '#reels']);
        setSameCaption(post.use_same_caption);
        setSuggestHashtags(post.suggest_hashtags);
        setAddFirstComment(post.add_first_comment);
        setFirstComment(post.first_comment || '');
        setVideoUrl(post.video_url);
        setVideoFilename(post.video_filename || '');
        setVideoMime(post.video_mime || '');
        setThumbnailUrl(post.thumbnail_url || '');
        setFileName(post.original_filename || post.video_filename || 'reel.mp4');
        setFileSize(post.video_size || null);
        setDuration(post.duration_seconds || null);
        setDimensions(post.width && post.height ? { width: post.width, height: post.height } : null);
        setPreviewUrl(resolveAssetUrl(post.video_url));
        const nextSelected = (post.targets || [])
            .filter((target) => target.enabled)
            .map((target) => String(target.social_account_id));
        setSelectedIds(nextSelected);
        const nextSchedules: Record<string, AccountSchedule> = {};
        for (const target of post.targets || []) {
            const parts = target.scheduled_at ? istDateParts(new Date(target.scheduled_at)) : defaultSchedule(0);
            nextSchedules[String(target.social_account_id)] = clampSchedule(
                parts.date,
                parts.time,
                target.caption || '',
            );
        }
        setSchedules(nextSchedules);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const editId = Number(searchParams.get('edit') || 0);
    useEffect(() => {
        if (!editId || !posts.length) return;
        const post = posts.find((item) => item.id === editId);
        if (!post) return;
        loadPost(post);
        searchParams.delete('edit');
        setSearchParams(searchParams, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId, posts]);

    const videoPreview = previewUrl || (videoUrl ? resolveAssetUrl(videoUrl) : '');
    const thumbPreview = thumbnailUrl ? resolveAssetUrl(thumbnailUrl) : '';
    const saving = saveReel.isPending || uploadReel.isPending;
    const nowIst = istDateParts();
    const hasPastSchedule = selectedAccounts.some((account) => {
        const schedule = schedules[String(account.id)];
        return !schedule || isScheduleBeforeNow(schedule.date, schedule.time);
    });

    return (
        <div className="-mx-4 -mt-4 md:-mx-8 md:-mt-7">
            <div className="mx-auto max-w-[1450px] px-4 pb-10 pt-6 md:px-7">
                {(banner || notice) && (
                    <div
                        className={`mb-4 rounded-[13px] border px-4 py-3 text-[12px] ${
                            banner?.type === 'error'
                                ? 'border-[#f3d0d0] bg-[#fff7f7] text-[#b4232c]'
                                : 'border-[#d8efe3] bg-[#f3fbf6] text-[#147a4b]'
                        }`}
                    >
                        {banner?.text || notice}
                    </div>
                )}

                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="m-0 text-[28px] font-extrabold tracking-[-1.2px]">
                            {editingId ? 'Edit scheduled reel' : 'Schedule a new reel'}
                        </h1>
                        <p className="mt-1.5 text-[11px] text-[#858891]">
                            Upload one reel and decide exactly where and when it goes live.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/creator/bulk-reels')}
                            className="rounded-[10px] border border-[#e9e9ef] bg-white px-3.5 py-2.5 text-[10px] font-extrabold"
                        >
                            Bulk upload
                        </button>
                        <button
                            type="button"
                            onClick={() => void save('scheduled')}
                            disabled={saving || hasPastSchedule}
                            className="rounded-[10px] bg-[#111318] px-3.5 py-2.5 text-[10px] font-extrabold text-white disabled:opacity-60"
                        >
                            {saving ? 'Working…' : 'Add to schedule →'}
                        </button>
                    </div>
                </div>

                <div className="grid items-start gap-3.5 lg:grid-cols-[235px_minmax(0,1fr)_320px]">
                    <aside className="rounded-[18px] border border-[#e9e9ef] bg-white p-4">
                        <div className="mb-3 flex items-start justify-between">
                            <div>
                                <h2 className="mb-1 text-[13px] font-bold">Connected accounts</h2>
                                <p className="m-0 text-[9px] text-[#8a8d95]">Choose where this reel should go</p>
                            </div>
                            {accounts.length > 0 && (
                                <button type="button" onClick={selectAll} className="text-[9px] font-bold text-[#be2d6b]">
                                    Select all
                                </button>
                            )}
                        </div>
                        <div className="mb-2.5 text-[9px] text-[#787b83]">
                            {accounts.length} account{accounts.length === 1 ? '' : 's'} connected
                        </div>
                        {accounts.length === 0 ? (
                            <div className="rounded-[13px] border border-dashed border-[#d9dae1] p-3 text-center">
                                <p className="text-[10px] text-[#8a8c94]">No Instagram accounts yet.</p>
                                <button
                                    type="button"
                                    onClick={() => connectInstagram()}
                                    className="mt-2 text-[10px] font-bold text-[#be2d6b]"
                                >
                                    {isConnecting ? 'Opening Instagram…' : 'Connect Instagram'}
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {accounts.map((account, index) => {
                                    const id = String(account.id);
                                    const selected = selectedIds.includes(id);
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => toggleAccount(id, index)}
                                            className={`flex items-center gap-2.5 rounded-[13px] border p-2.5 text-left ${
                                                selected
                                                    ? 'border-[#e9408a] bg-[#fff4f8] shadow-[0_0_0_2px_rgba(233,64,138,0.05)]'
                                                    : 'border-[#e9e9ef]'
                                            }`}
                                        >
                                            <div
                                                className="h-[35px] w-[35px] flex-none rounded-full"
                                                style={accountAvatarStyle(account, index)}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <strong className="block text-[11px]">@{account.username}</strong>
                                                <span className="mt-0.5 block text-[9px] text-[#8a8c94]">
                                                    {formatCount(account.followers_count || 0)} followers
                                                </span>
                                            </div>
                                            <div
                                                className={`grid h-[17px] w-[17px] place-items-center rounded-full text-[9px] ${
                                                    selected
                                                        ? 'border border-[#e9408a] bg-[#e9408a] text-white'
                                                        : 'border border-[#d6d7de] text-transparent'
                                                }`}
                                            >
                                                ✓
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <p className="mt-4 border-t border-[#efeff2] pt-3 text-[9px] leading-relaxed text-[#898c94]">
                            Each selected account can have its own date, time and caption before publishing.
                        </p>
                    </aside>

                    <section className="min-h-[580px] rounded-[18px] border border-[#e9e9ef] bg-white p-4">
                        <div className="mb-3 flex items-start justify-between">
                            <div>
                                <h2 className="mb-1 text-[13px] font-bold">Reel content</h2>
                                <p className="m-0 text-[9px] text-[#8a8d95]">Upload MP4/MOV · Recommended 9:16 vertical video</p>
                            </div>
                            <span className="text-[9px] font-bold text-[#be2d6b]">Up to 100MB</span>
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="video/mp4,video/quicktime,.mp4,.mov"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void handleVideoFile(file);
                                event.target.value = '';
                            }}
                        />

                        <div
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                            className={`relative flex h-[350px] items-center justify-center overflow-hidden rounded-[18px] border-[1.5px] ${
                                videoPreview
                                    ? 'border-solid border-[#e9e9ef] bg-[#101116]'
                                    : `border-dashed ${dragging ? 'border-[#e9408a] bg-[#fff7fb]' : 'border-[#d8d9e0] bg-gradient-to-b from-[#fcfcfd] to-[#f8f8fb]'}`
                            }`}
                        >
                            {videoPreview ? (
                                <div className="relative">
                                    <video
                                        src={videoPreview}
                                        poster={thumbPreview || undefined}
                                        className="h-[290px] w-[176px] rounded-[20px] border-[5px] border-white/20 object-cover shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
                                        controls
                                        muted
                                    />
                                    <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/55 px-1.5 py-1 text-[8px] text-white">
                                        {formatDuration(duration)}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mx-auto mb-3 grid h-[58px] w-[58px] place-items-center rounded-[17px] border border-[#e9e9ef] bg-white text-[#555861] shadow-[0_8px_18px_rgba(20,20,40,0.05)]">
                                        <svg viewBox="0 0 24 24" className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.7]">
                                            <path d="M12 16V5" />
                                            <path d="M8 9l4-4 4 4" />
                                            <path d="M4 19h16" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-1 text-[14px] font-bold">Drop your reel here</h3>
                                    <p className="mb-3 text-[10px] text-[#8a8d95]">
                                        Upload one video and schedule it across multiple accounts.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="rounded-[9px] bg-[#111318] px-3.5 py-2 text-[10px] font-extrabold text-white"
                                    >
                                        Choose video
                                    </button>
                                </div>
                            )}
                        </div>

                        {fileName && (
                            <div className="mt-3 flex items-center justify-between">
                                <div>
                                    <strong className="block text-[11px]">{fileName}</strong>
                                    <span className="text-[9px] text-[#8d9098]">
                                        {fileSize ? `${formatFileSize(fileSize)} · ` : ''}
                                        {dimensions ? `${dimensions.width} × ${dimensions.height} · ` : ''}
                                        {formatDuration(duration)}
                                        {uploadReel.isPending ? ' · Uploading…' : ''}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="rounded-[9px] border border-[#e9e9ef] bg-white px-2.5 py-2 text-[9px] font-bold"
                                >
                                    Replace
                                </button>
                            </div>
                        )}

                        <div className="mt-4">
                            <div className="mb-2 flex justify-between text-[10px] font-extrabold">
                                <span>Caption</span>
                                <span className="font-medium text-[#a0a2aa]">{caption.length} / 2200</span>
                            </div>
                            <textarea
                                value={caption}
                                maxLength={2200}
                                onChange={(event) => setCaption(event.target.value)}
                                placeholder="Write your reel caption... e.g. Introducing our new summer drop ✨"
                                className="min-h-[85px] w-full resize-y rounded-xl border border-[#e9e9ef] px-3 py-2.5 text-[11px] leading-relaxed outline-none"
                            />
                            <div className="mt-3">
                                <div className="mb-2 flex justify-between text-[10px] font-extrabold">
                                    <span>Hashtags</span>
                                    <span className="font-medium text-[#a0a2aa]">Add or choose suggestions</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {HASHTAG_SUGGESTIONS.map((tag) => {
                                        const active = hashtags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => setHashtags((current) => (
                                                    current.includes(tag)
                                                        ? current.filter((item) => item !== tag)
                                                        : [...current, tag]
                                                ))}
                                                className={`rounded-full px-2 py-1.5 text-[9px] ${
                                                    active ? 'bg-[#fff0f7] text-[#bd2868]' : 'bg-[#f3f3f6] text-[#656872]'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                    {hashtags.filter((tag) => !HASHTAG_SUGGESTIONS.includes(tag)).map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setHashtags((current) => current.filter((item) => item !== tag))}
                                            className="rounded-full bg-[#fff0f7] px-2 py-1.5 text-[9px] text-[#bd2868]"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 flex gap-1.5">
                                    <input
                                        value={customTag}
                                        onChange={(event) => setCustomTag(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                addHashtag();
                                            }
                                        }}
                                        placeholder="Add custom hashtag"
                                        className="h-9 flex-1 rounded-[9px] border border-[#e9e9ef] px-2 text-[11px] outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={addHashtag}
                                        className="rounded-[9px] border border-[#e9e9ef] bg-white px-2.5 text-[9px] font-bold"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="grid gap-3.5 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
                        <div className="rounded-[18px] border border-[#e9e9ef] bg-white p-4">
                            <div className="mb-3">
                                <h2 className="mb-1 text-[13px] font-bold">Schedule by account</h2>
                                <p className="m-0 text-[9px] text-[#8a8d95]">Set individual publishing times</p>
                            </div>
                            <div className="grid gap-2">
                                {accounts.map((account, index) => {
                                    const id = String(account.id);
                                    const selected = selectedIds.includes(id);
                                    const schedule = schedules[id] || defaultSchedule(index);
                                    const pastSchedule = selected && isScheduleBeforeNow(schedule.date, schedule.time);
                                    return (
                                        <div
                                            key={id}
                                            className={`rounded-[13px] border p-2.5 ${
                                                selected ? (pastSchedule ? 'border-[#e7b4b4]' : 'border-[#e9e9ef]') : 'border-[#e9e9ef] opacity-55'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-[30px] w-[30px] flex-none rounded-full"
                                                    style={accountAvatarStyle(account, index)}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <strong className="block text-[10px]">@{account.username}</strong>
                                                    <span className="text-[8px] text-[#8a8d95]">
                                                        {selected ? accountRoleLabel(account, index) : 'Not selected'}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAccount(id, index)}
                                                    className={`h-[18px] w-8 rounded-full p-0.5 ${selected ? 'bg-[#e9408a]' : 'bg-[#ececf1]'}`}
                                                    aria-label={`Toggle @${account.username}`}
                                                >
                                                    <span className={`block h-3.5 w-3.5 rounded-full bg-white shadow ${selected ? 'ml-3.5' : ''}`} />
                                                </button>
                                            </div>
                                            {selected && (
                                                <>
                                                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                                                        <label className="block">
                                                            <span className="mb-1 block text-[8px] text-[#8b8d95]">Date</span>
                                                            <input
                                                                type="date"
                                                                min={nowIst.date}
                                                                value={schedule.date}
                                                                onChange={(event) => updateSchedule(id, { date: event.target.value }, schedule)}
                                                                className={`h-9 w-full rounded-[9px] border px-2 text-[9px] ${
                                                                    pastSchedule ? 'border-[#e7b4b4]' : 'border-[#e9e9ef]'
                                                                }`}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className="mb-1 block text-[8px] text-[#8b8d95]">Time</span>
                                                            <input
                                                                type="time"
                                                                min={schedule.date === nowIst.date ? nowIst.time : undefined}
                                                                value={schedule.time}
                                                                onChange={(event) => updateSchedule(id, { time: event.target.value }, schedule)}
                                                                className={`h-9 w-full rounded-[9px] border px-2 text-[9px] ${
                                                                    pastSchedule ? 'border-[#e7b4b4]' : 'border-[#e9e9ef]'
                                                                }`}
                                                            />
                                                        </label>
                                                    </div>
                                                    {pastSchedule && (
                                                        <p className="mt-1.5 text-[8px] text-[#c23b3b]">
                                                            Date and time cannot be before now.
                                                        </p>
                                                    )}
                                                    {!sameCaption && (
                                                        <textarea
                                                            value={schedule.caption}
                                                            onChange={(event) => setSchedules((current) => ({
                                                                ...current,
                                                                [id]: { ...schedule, caption: event.target.value },
                                                            }))}
                                                            placeholder={`Caption for @${account.username}`}
                                                            className="mt-2 min-h-[70px] w-full rounded-[10px] border border-[#e9e9ef] px-2 py-2 text-[10px] outline-none"
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = accounts.find((account) => !selectedIds.includes(String(account.id)));
                                    if (next) {
                                        toggleAccount(String(next.id), accounts.findIndex((account) => account.id === next.id));
                                        return;
                                    }
                                    connectInstagram();
                                }}
                                className="mt-2 w-full rounded-[9px] border border-dashed border-[#d9dae1] bg-[#fafafd] py-2 text-[9px] font-bold text-[#777b84]"
                            >
                                + Add another account schedule
                            </button>
                            <div className="mt-2 text-[8px] text-[#9a9ca4]">Timezone: IST (UTC+05:30)</div>
                            <div className="mt-2.5 rounded-[13px] border border-[#ededf1] bg-[#fafafd] p-2.5">
                                <div className="my-1 flex justify-between text-[9px] text-[#777a83]">
                                    <span>Accounts selected</span>
                                    <strong className="text-[#111318]">{selectedIds.length}</strong>
                                </div>
                                <div className="my-1 flex justify-between text-[9px] text-[#777a83]">
                                    <span>Posts to publish</span>
                                    <strong className="text-[#111318]">{selectedIds.length}</strong>
                                </div>
                                <div className="mt-1.5 flex justify-between border-t border-[#e9e9ee] pt-1.5 text-[9px] font-bold">
                                    <span>Next publish</span>
                                    <strong>{nextPublish}</strong>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => void save('scheduled')}
                                disabled={saving || hasPastSchedule}
                                className="mt-3 h-11 w-full rounded-[11px] bg-[#111318] text-[10px] font-extrabold text-white disabled:opacity-60"
                            >
                                {saving ? 'Scheduling…' : `Schedule ${selectedIds.length || 0} reel${selectedIds.length === 1 ? '' : 's'} →`}
                            </button>
                            <div className="mt-2 text-center text-[8px] leading-relaxed text-[#a0a2aa]">
                                Publishing uses the authorized Meta/Instagram connection for each selected account. Videos are stored on this server.
                            </div>
                            <button
                                type="button"
                                onClick={() => void save('draft')}
                                disabled={saving}
                                className="mt-2 w-full rounded-[9px] border border-[#e9e9ef] bg-white py-2 text-[9px] font-bold"
                            >
                                Save draft
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetComposer}
                                    className="mt-2 w-full text-[9px] font-bold text-[#8a8c94]"
                                >
                                    Clear and start a new reel
                                </button>
                            )}
                        </div>

                        <div className="rounded-[18px] border border-[#e9e9ef] bg-white p-4">
                            <div className="mb-3">
                                <h2 className="mb-1 text-[13px] font-bold">Account-specific publishing</h2>
                                <p className="m-0 text-[9px] text-[#8a8d95]">Customize before scheduling</p>
                            </div>
                            <label className="mb-2 flex items-center gap-1.5 text-[9px]">
                                <input
                                    type="checkbox"
                                    checked={sameCaption}
                                    onChange={() => setSameCaption(true)}
                                    className="h-3.5 w-3.5"
                                />
                                Use same caption on all accounts
                            </label>
                            <label className="mb-2 flex items-center gap-1.5 text-[9px]">
                                <input
                                    type="checkbox"
                                    checked={!sameCaption}
                                    onChange={() => setSameCaption(false)}
                                    className="h-3.5 w-3.5"
                                />
                                Customize caption per account
                            </label>
                            <label className="mb-2 flex items-center gap-1.5 text-[9px]">
                                <input
                                    type="checkbox"
                                    checked={suggestHashtags}
                                    onChange={(event) => setSuggestHashtags(event.target.checked)}
                                    className="h-3.5 w-3.5"
                                />
                                Suggest hashtags automatically
                            </label>
                            <label className="mb-2 flex items-center gap-1.5 text-[9px]">
                                <input
                                    type="checkbox"
                                    checked={addFirstComment}
                                    onChange={(event) => setAddFirstComment(event.target.checked)}
                                    className="h-3.5 w-3.5"
                                />
                                Add first comment after publishing
                            </label>
                            {addFirstComment && (
                                <textarea
                                    value={firstComment}
                                    onChange={(event) => setFirstComment(event.target.value)}
                                    placeholder="First comment to post after the reel goes live"
                                    className="mt-1 min-h-[70px] w-full rounded-[10px] border border-[#e9e9ef] px-2 py-2 text-[10px] outline-none"
                                />
                            )}
                        </div>
                    </aside>
                </div>

                <div className="mt-4 rounded-[18px] border border-[#e9e9ef] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="m-0 text-[13px] font-bold">Upcoming schedule</h2>
                        <span className="text-[9px] text-[#888b93]">
                            {postsLoading ? 'Loading…' : `${upcoming.length} post${upcoming.length === 1 ? '' : 's'} queued`}
                        </span>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="py-4 text-[11px] text-[#8a8c94]">No scheduled reels yet. Upload a video and add it to the schedule.</p>
                    ) : (
                        <>
                            <div className="hidden border-b border-[#f0f0f3] pb-2 text-[8px] uppercase tracking-[0.4px] text-[#8b8d95] md:grid md:grid-cols-[52px_minmax(0,1.2fr)_minmax(170px,1fr)_130px_90px_110px] md:items-center md:gap-2.5">
                                <span />
                                <span>Reel</span>
                                <span>Instagram account</span>
                                <span>Schedule</span>
                                <span>Status</span>
                                <span className="text-right">Actions</span>
                            </div>
                            {upcoming.map((post) => {
                            const enabled = (post.targets || []).filter((target) => target.enabled);
                            const next = enabled
                                .map((target) => target.scheduled_at)
                                .filter(Boolean)
                                .sort()[0];
                            const status = queueStatus(post);
                            const failedTarget = enabled.find((target) => target.status === 'failed');
                            return (
                                <div
                                    key={post.id}
                                    className="grid grid-cols-[52px_minmax(0,1fr)_minmax(120px,0.9fr)] items-center gap-2.5 border-t border-[#f0f0f3] py-2.5 md:grid-cols-[52px_minmax(0,1.2fr)_minmax(170px,1fr)_130px_90px_110px]"
                                >
                                    <div
                                        className="relative h-12 overflow-hidden rounded-lg bg-gradient-to-br from-[#dba5a9] via-[#e9408a] to-[#27232a]"
                                        style={post.thumbnail_url ? {
                                            backgroundImage: `url(${resolveAssetUrl(post.thumbnail_url)})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        } : undefined}
                                    >
                                        <span className="absolute left-1/2 top-1/2 -translate-x-[35%] -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent border-l-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <strong className="block truncate text-[10px]">{post.original_filename || post.video_filename || 'reel.mp4'}</strong>
                                        <span className="mt-0.5 block text-[8px] text-[#8b8e96]">
                                            {post.video_size ? `${formatFileSize(post.video_size)} · ` : ''}
                                            {formatDuration(post.duration_seconds)}
                                        </span>
                                        {failedTarget?.error_message && (
                                            <span className="mt-1 block text-[8px] text-[#c23b3b]">{failedTarget.error_message}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 space-y-1.5">
                                        {enabled.length === 0 ? (
                                            <span className="text-[8px] text-[#8b8e96]">No account</span>
                                        ) : enabled.map((target, index) => {
                                            const account: SocialAccountRecord = {
                                                id: String(target.social_account?.id || target.social_account_id),
                                                platform: 'instagram',
                                                username: target.social_account?.username || 'account',
                                                display_name: target.social_account?.display_name,
                                                profile_image: target.social_account?.profile_image,
                                                account_type: target.social_account?.account_type,
                                                followers_count: target.social_account?.followers_count,
                                                is_connected: target.social_account?.is_connected,
                                            };
                                            return (
                                                <div key={target.id} className="flex min-w-0 items-center gap-2">
                                                    <div
                                                        className="h-7 w-7 flex-none rounded-full"
                                                        style={accountAvatarStyle(account, index)}
                                                    />
                                                    <div className="min-w-0">
                                                        <strong className="block truncate text-[9px]">@{account.username}</strong>
                                                        <span className="mt-0.5 block truncate text-[8px] text-[#8b8e96]">
                                                            {formatCount(account.followers_count || 0)} followers
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="hidden md:block">
                                        <strong className="block text-[9px]">{formatIstLabel(next)}</strong>
                                        <span className="mt-0.5 block text-[8px] text-[#8b8e96]">IST</span>
                                    </div>
                                    <div className={`hidden rounded-full px-2 py-1 text-center text-[8px] font-bold md:block ${statusClass(status.toLowerCase())}`}>
                                        {status}
                                    </div>
                                    <div className="hidden text-right md:block">
                                        {['draft', 'scheduled', 'failed'].includes(post.status) && (
                                            <button
                                                type="button"
                                                onClick={() => loadPost(post)}
                                                className="rounded-lg border border-[#e9e9ef] bg-white px-2 py-1.5 text-[8px]"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {post.status === 'scheduled' && (
                                            <button
                                                type="button"
                                                onClick={() => cancelReel.mutate(post.id)}
                                                className="ml-1 rounded-lg border border-[#e9e9ef] bg-white px-2 py-1.5 text-[8px]"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {failedTarget && (
                                            <button
                                                type="button"
                                                onClick={() => retryTarget.mutate(failedTarget.id)}
                                                className="ml-1 rounded-lg border border-[#e9e9ef] bg-white px-2 py-1.5 text-[8px]"
                                            >
                                                Retry
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
