import React, { useState, useEffect } from 'react';
import { COLORS } from './components/shared-ui';
import { GuestSidebar } from './components/guest-sidebar';
import { GuestWorkspace } from './components/guest-workspace';
import {
  AuthSidebar,
  AuthHeader,
  FloatingComposerDock,
  SAMPLE_DRAFTS,
} from './components/auth-sidebar-header';
import { NewAnalysisEmptyView } from './components/auth-audit-views';
import { MultiTurnAuditStreamView } from './components/MultiTurnAuditStreamView';
import { AuditOptionsOverlay, DEFAULT_THRESHOLDS } from './components/AuditOptionsOverlay';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthModal } from './components/AuthModal';
import { ExecutiveAuditPrintReport } from './components/ExecutiveAuditPrintReport';
import { useToast } from './context/ToastContext';
import { useTheme } from './context/ThemeContext';
import { waskitaClient } from './api/waskitaClient';
import {
  INITIAL_AUDIT_TURN_1,
  INITIAL_AUDIT_TURN_2,
} from './api/mockData';
import {
  AuditExecuteResponse,
  QualityThresholds,
  AuditSessionSummary,
} from './types/waskita';
import { countPureWords, extractSmartKeyword } from './utils/draftSanitizer';
import { parseUploadedFileClientSide, exportAuditToMarkdown } from './utils/clientExporter';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  // Mode: Guest vs Authenticated (Member)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Responsive state
  const [isDesktop, setIsDesktop] = useState<boolean>(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sessions state
  const [sessions, setSessions] = useState<AuditSessionSummary[]>([
    {
      session_id: 'session-1',
      parent_session_id: null,
      turn_number: 2,
      target_query: 'resep kopi tubruk tradisional',
      draft_title: 'Resep Kopi Tubruk Tradisional & Takaran Pas',
      audit_timestamp: '2026-10-22T10:15:00+07:00',
      verdict_status: 'Layak Terbit',
      score_cds: 85,
      is_pinned: false,
    },
    {
      session_id: 'session-2',
      parent_session_id: null,
      turn_number: 1,
      target_query: 'restorasi vespa klasik px150',
      draft_title: 'Restorasi Vespa Klasik PX 150 & Panduan Suku Cadang',
      audit_timestamp: '2026-10-21T16:40:00+07:00',
      verdict_status: 'Layak Terbit',
      score_cds: 82,
      is_pinned: false,
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string | null>('session-1');

  // Multi-turn stream for current active session
  const [currentTurns, setCurrentTurns] = useState<
    Array<{
      draftTitle?: string;
      draftContent?: string;
      auditResult: AuditExecuteResponse;
    }>
  >([
    {
      draftTitle: 'Resep Kopi Tubruk Tradisional & Takaran Pas',
      draftContent:
        'Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan cara menyeduh bubuk kopi secara langsung tanpa disaring sama sekali...',
      auditResult: INITIAL_AUDIT_TURN_1,
    },
    {
      draftTitle: 'Resep Kopi Tubruk Tradisional & Takaran Pas (Revisi #2)',
      draftContent:
        'Menikmati seduhan kopi tubruk sejatinya merayakan kesederhanaan rasa yang jujur tanpa intervensi saringan mekanis...',
      auditResult: INITIAL_AUDIT_TURN_2,
    },
  ]);

  // Input composer draft state
  const [draftInput, setDraftInput] = useState<string>('');
  const [targetQuery, setTargetQuery] = useState<string>('resep kopi tubruk tradisional');
  const [isPlusGlowing, setIsPlusGlowing] = useState<boolean>(false);
  const [detectedKeywordHint, setDetectedKeywordHint] = useState<string | null>(null);

  // Thresholds state dengan persistensi localStorage (waskita_custom_thresholds)
  const [thresholds, setThresholds] = useState<QualityThresholds>(() => {
    try {
      const saved = localStorage.getItem('waskita_custom_thresholds');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse waskita_custom_thresholds:', e);
    }
    return DEFAULT_THRESHOLDS;
  });

  const handleThresholdsChange = (newThresholds: QualityThresholds) => {
    setThresholds(newThresholds);
    try {
      localStorage.setItem('waskita_custom_thresholds', JSON.stringify(newThresholds));
    } catch (e) {
      console.warn('Failed to save waskita_custom_thresholds:', e);
    }
  };

  // UI Drawer & Popover toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Stepper state for live audit submit
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTransitioningToDock, setIsTransitioningToDock] = useState<boolean>(false);
  const [stepperStep, setStepperStep] = useState<number>(1);
  const [stepperMessage, setStepperMessage] = useState<string>('');
  const [isStepperFadingOut, setIsStepperFadingOut] = useState<boolean>(false);

  // Print state
  const [printAuditData, setPrintAuditData] = useState<AuditExecuteResponse | null>(null);

  // Confirmation Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteTargetSessionId, setDeleteTargetSessionId] = useState<string | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [renameTargetSessionId, setRenameTargetSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // Auto-authentication demo on mount for member mode
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('waskita_token');
      if (token) {
        waskitaClient.setToken(token);
      } else {
        // Auto-authenticate as author_demo via API client
        try {
          await waskitaClient.login('author_demo', 'password123');
        } catch (e) {
          // Dev fallback
          waskitaClient.setToken('demo-token-author-demo');
        }
      }

      // Fetch user sessions from backend SQLite WAL
      try {
        const fetchedSessions = await waskitaClient.getSessions();
        if (fetchedSessions && fetchedSessions.length > 0) {
          setSessions(fetchedSessions);
          const first = fetchedSessions[0];
          setActiveSessionId(first.session_id);
          if (first.target_query) {
            setTargetQuery(first.target_query);
          }
          try {
            const thread = await waskitaClient.getSessionThread(first.session_id);
            if (thread && thread.length > 0) {
              setCurrentTurns(
                thread.map((t) => ({
                  draftTitle: t.draft_title,
                  draftContent: t.draft_content || '',
                  auditResult: t,
                }))
              );
            }
          } catch (threadErr) {
            console.warn('Gagal memuat thread sesi pertama:', threadErr);
          }
        }
      } catch (e) {
        // Keep initial sessions state
      }
    };

    if (isAuthenticated) {
      initAuth();
    }
  }, [isAuthenticated]);

  // Handle Paste with auto sanitization & keyword detection
  const handlePasteSanitized = (cleanText: string, keywordCandidate: string) => {
    setDraftInput(cleanText);
    if (keywordCandidate) {
      setTargetQuery(keywordCandidate);
      setDetectedKeywordHint(keywordCandidate);
      setIsPlusGlowing(true);
      setTimeout(() => setIsPlusGlowing(false), 3500);
      setTimeout(() => setDetectedKeywordHint(null), 6000);
    }
  };

  const handleSelectSampleDraft = (sampleKey: 'revisionNeeded' | 'approvedReady') => {
    const sample = SAMPLE_DRAFTS[sampleKey];
    if (sample) {
      setDraftInput(sample.text);
      setTargetQuery(sample.query);
      setDetectedKeywordHint(sample.query);
      setIsPlusGlowing(true);
      setTimeout(() => setIsPlusGlowing(false), 3500);
      setTimeout(() => setDetectedKeywordHint(null), 6000);
    }
  };

  // 1. Submit Audit with 5-stage Live Stepper & Fade-out transition
  const handleExecuteAudit = async (contentToSubmit?: string) => {
    const content = contentToSubmit || draftInput;
    if (!content.trim()) {
      showToast({
        type: 'warning',
        title: 'Naskah Kosong',
        message: 'Ketik atau tempel naskah artikel terlebih dahulu sebelum memulai audit.',
      });
      return;
    }

    const wordCount = countPureWords(content);
    if (wordCount < 300) {
      showToast({
        type: 'warning',
        title: 'Kata-kata Belum Cukup',
        message: `Naskah baru memiliki ${wordCount} / 300 kata minimum. Lengkapi naskah Anda agar evaluasi valid.`,
      });
      return;
    }

    setIsLoading(true);
    setIsTransitioningToDock(true);
    setIsStepperFadingOut(false);
    setStepperStep(1);
    setStepperMessage('Mengekstrak & menormalisasi draf naskah...');

    const stepTimer1 = setTimeout(() => {
      setStepperStep(2);
      setStepperMessage('Mengakuisisi korpus Top-10 kompetitor SERP...');
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setStepperStep(3);
      setStepperMessage('Melakukan tokenisasi & stemming Sastrawi...');
    }, 1800);

    const stepTimer3 = setTimeout(() => {
      setStepperStep(4);
      setStepperMessage('Menghitung matriks TF-IDF, Cosine Similarity, & Information Gain...');
    }, 2700);

    const stepTimer4 = setTimeout(() => {
      setStepperStep(5);
      setStepperMessage('Menyusun evaluasi stilometri (MATTR, HKO) & vonis CDS...');
    }, 3600);

    try {
      const parentSession =
        currentTurns.length > 0
          ? currentTurns[currentTurns.length - 1].auditResult.session_id
          : null;
      let result: AuditExecuteResponse;

      try {
        result = await waskitaClient.executeAudit({
          target_query: targetQuery,
          draft_title: `Draf: ${targetQuery.substring(0, 32)}...`,
          draft_content: content,
          parent_session_id: parentSession,
          use_cached_serp: true,
          thresholds,
        });
      } catch (err: any) {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        clearTimeout(stepTimer3);
        clearTimeout(stepTimer4);
        console.error('Audit execution error:', err);
        const errMsg =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          'Gagal melakukan audit naskah. Pastikan backend aktif.';
        showToast({
          type: 'error',
          message: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
        });
        setIsLoading(false);
        setIsStepperFadingOut(false);
        setIsTransitioningToDock(false);
        return;
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      // Trigger Stepper Centang Hijau -> Fade-Out Halus
      setIsStepperFadingOut(true);
      await new Promise((r) => setTimeout(r, 450));

      setCurrentTurns((prev) => [
        ...prev,
        {
          draftTitle: result.draft_title,
          draftContent: content,
          auditResult: result,
        },
      ]);

      // If active session was 'new', update sidebar
      if (!activeSessionId || activeSessionId === 'session-new') {
        const newSessionId = result.session_id;
        setActiveSessionId(newSessionId);
        setSessions((prev) => [
          {
            session_id: newSessionId,
            parent_session_id: null,
            turn_number: 1,
            target_query: targetQuery,
            draft_title: result.draft_title,
            audit_timestamp: result.audit_timestamp,
            verdict_status: result.verdict_status,
            score_cds: result.metrics.content_differentiation_score,
            is_pinned: false,
          },
          ...prev,
        ]);
      }

      setDraftInput('');
      showToast({
        type: 'success',
        title: 'Audit Berhasil',
        message: `Hasil analisis #${result.turn_number} siap: CDS ${Math.round(
          result.metrics.content_differentiation_score
        )}% (${result.verdict_status})`,
      });
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      showToast({
        type: 'error',
        title: 'Audit Gagal',
        message: err.message || 'Terjadi kesalahan sistem saat memproses audit.',
      });
    } finally {
      setIsLoading(false);
      setIsStepperFadingOut(false);
      setStepperStep(1);
      setStepperMessage('');
    }
  };

  // 2. Client-Side File Uploader Handler (.md, .txt, .docx) sesuai Standar PZN
  const handleFileUpload = async (file: File) => {
    try {
      showToast({
        type: 'info',
        title: 'Mengekstrak Berkas (Client-Side)',
        message: `Membaca ${file.name}...`,
      });

      const parsed = await parseUploadedFileClientSide(file);
      setDraftInput(parsed.text);

      const smartKey = extractSmartKeyword(parsed.text);
      if (smartKey) {
        setTargetQuery(smartKey);
        setDetectedKeywordHint(smartKey);
        setIsPlusGlowing(true);
        setTimeout(() => setIsPlusGlowing(false), 3500);
        setTimeout(() => setDetectedKeywordHint(null), 6000);
      }

      setIsOptionsOpen(false);
      showToast({
        type: 'success',
        title: 'Berkas Berhasil Dimuat',
        message: `Naskah (${parsed.wordCount} kata, ${parsed.imageCount} gambar, ${parsed.videoCount} video) siap diaudit.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Ekstraksi Gagal',
        message: err.message || 'Gagal membaca berkas.',
      });
    }
  };

  // 3. Header Action Handlers
  const handleCopyRemediationPrompt = () => {
    if (currentTurns.length === 0) return;
    const latest = currentTurns[currentTurns.length - 1].auditResult;
    const promptText = latest.remediation_prompt;
    if (!promptText) return;

    navigator.clipboard.writeText(promptText);
    showToast({
      type: 'success',
      title: 'Prompt Rekomendasi Tersalin ✓',
      message: 'Prompt remediasi perbaikan naskah disalin ke papan klip.',
    });
  };

  const handleCopySummary = () => {
    if (currentTurns.length === 0) return;
    const latest = currentTurns[currentTurns.length - 1].auditResult;
    const summary = `[WASKITA AUDIT REPORT]
Judul: ${latest.draft_title}
Kueri: ${latest.target_query}
Status: ${latest.verdict_status}
Skor CDS: ${Math.round(latest.metrics.content_differentiation_score)}%
Max Cosine: ${latest.metrics.max_cosine_similarity.toFixed(2)}
MATTR: ${latest.metrics.mattr_score.toFixed(2)}
HKO Overlap: ${Math.round(latest.metrics.hko_percentage)}%`;

    navigator.clipboard.writeText(summary);
    showToast({
      type: 'success',
      title: 'Tersalin',
      message: 'Ringkasan hasil analisis disalin ke papan klip.',
    });
  };

  const handleDownloadReport = () => {
    if (currentTurns.length === 0) return;
    const latest = currentTurns[currentTurns.length - 1];
    exportAuditToMarkdown(latest.auditResult, latest.draftContent);
    showToast({
      type: 'success',
      title: 'Laporan Diunduh',
      message: 'Berkas .md berhasil digenerate di sisi browser (PZN Client-Side).',
    });
  };

  const handleCopyDraft = () => {
    if (currentTurns.length === 0) return;
    const latest = currentTurns[currentTurns.length - 1];
    const text = latest.draftContent || latest.auditResult.draft_title;
    navigator.clipboard.writeText(text);
    showToast({
      type: 'success',
      title: 'Tersalin',
      message: 'Teks naskah artikel berhasil disalin.',
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast({
      type: 'info',
      title: 'Tautan Dibagikan',
      message: 'Tautan sesi analisis telah disalin ke papan klip.',
    });
  };

  const handlePin = async (sessionIdToPin?: string) => {
    const targetId = sessionIdToPin || activeSessionId;
    if (!targetId) return;

    setSessions((prev) =>
      prev.map((s) => (s.session_id === targetId ? { ...s, is_pinned: !s.is_pinned } : s))
    );

    try {
      const currentObj = sessions.find((s) => s.session_id === targetId);
      await waskitaClient.updateSession(targetId, {
        is_pinned: !currentObj?.is_pinned,
      });
    } catch (e) {
      // Local state already updated
    }

    showToast({
      type: 'success',
      title: 'Status Disematkan',
      message: 'Status pin sesi berhasil diperbarui.',
    });
  };

  const handleRenameClick = (sessionId?: string, title?: string) => {
    const targetId = sessionId || activeSessionId;
    const cur = sessions.find((s) => s.session_id === targetId);
    setRenameTargetSessionId(targetId);
    setRenameValue(title || cur?.draft_title || '');
    setRenameModalOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (!renameValue.trim() || !renameTargetSessionId) return;
    const targetId = renameTargetSessionId;
    const newTitle = renameValue.trim();

    setSessions((prev) =>
      prev.map((s) => (s.session_id === targetId ? { ...s, draft_title: newTitle } : s))
    );

    try {
      await waskitaClient.updateSession(targetId, {
        draft_title: newTitle,
      });
    } catch (e) {
      // Local state already updated
    }

    setRenameModalOpen(false);
    showToast({
      type: 'success',
      title: 'Judul Diperbarui',
      message: 'Judul sesi analisis berhasil diubah.',
    });
  };

  const handleDeleteClick = (sessionId?: string) => {
    setDeleteTargetSessionId(sessionId || activeSessionId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const targetId = deleteTargetSessionId || activeSessionId;
    if (!targetId) return;

    setSessions((prev) => prev.filter((s) => s.session_id !== targetId));
    if (activeSessionId === targetId) {
      setActiveSessionId('session-new');
      setCurrentTurns([]);
    }

    try {
      await waskitaClient.deleteSession(targetId);
    } catch (e) {
      // Local state already updated
    }

    setDeleteModalOpen(false);
    showToast({
      type: 'info',
      title: 'Riwayat Dihapus',
      message: 'Sesi analisis telah dihapus dari database.',
    });
  };

  const handleExportSessionById = (sessionId: string) => {
    const sessionObj = sessions.find((s) => s.session_id === sessionId);
    if (currentTurns.length > 0 && activeSessionId === sessionId) {
      exportAuditToMarkdown(
        currentTurns[currentTurns.length - 1].auditResult,
        currentTurns[currentTurns.length - 1].draftContent
      );
    } else {
      // Mock / fallback export
      exportAuditToMarkdown({
        session_id: sessionId,
        parent_session_id: null,
        turn_number: 1,
        target_query: sessionObj?.target_query || 'audit',
        draft_title: sessionObj?.draft_title || 'Naskah Artikel',
        draft_word_count: 350,
        audit_timestamp: sessionObj?.audit_timestamp || new Date().toISOString(),
        verdict_status: sessionObj?.verdict_status || 'Layak Terbit',
        degradation_warning: null,
        thresholds,
        metrics: {
          content_differentiation_score: sessionObj?.score_cds || 80,
          avg_cosine_similarity: 0.45,
          max_cosine_similarity: 0.52,
          euclidean_distance: 1.1,
          ttr_score: 0.6,
          mattr_score: 0.58,
          hko_percentage: 25,
          is_redundant: false,
          is_keyword_stuffed: false,
        },
        entity_gaps: { deficit: [], gain: [] },
        annotated_spans: [],
        overview_bullets: ['Audit tersimpan dari riwayat database.'],
        remediation_prompt: 'Naskah memenuhi standar.',
      });
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setIsTransitioningToDock(false);
    setActiveSessionId(sessionId);
    const sessionObj = sessions.find((s) => s.session_id === sessionId);
    if (sessionObj && sessionObj.target_query) {
      setTargetQuery(sessionObj.target_query);
    }
    try {
      const thread = await waskitaClient.getSessionThread(sessionId);
      if (thread && thread.length > 0) {
        setCurrentTurns(
          thread.map((t) => ({
            draftTitle: t.draft_title,
            draftContent: t.draft_content || '',
            auditResult: t,
          }))
        );
        if (thread[0]?.target_query) {
          setTargetQuery(thread[0].target_query);
        }
        return;
      }
    } catch (e) {
      // Fallback local mock sessions
    }

    if (sessionId === 'session-1') {
      setTargetQuery('resep kopi tubruk tradisional');
      setCurrentTurns([
        {
          draftTitle: 'Resep Kopi Tubruk Tradisional & Takaran Pas',
          draftContent: SAMPLE_DRAFTS.revisionNeeded.text,
          auditResult: INITIAL_AUDIT_TURN_1,
        },
        {
          draftTitle: 'Resep Kopi Tubruk Tradisional & Takaran Pas (Revisi #2)',
          draftContent: SAMPLE_DRAFTS.approvedReady.text,
          auditResult: INITIAL_AUDIT_TURN_2,
        },
      ]);
    } else if (sessionId === 'session-2') {
      setTargetQuery('restorasi vespa klasik px150');
      setCurrentTurns([
        {
          draftTitle: 'Restorasi Vespa Klasik PX 150 & Panduan Suku Cadang',
          draftContent: 'Restorasi skuter klasik memerlukan ketelitian...',
          auditResult: {
            ...INITIAL_AUDIT_TURN_2,
            session_id: 'session-2',
            target_query: 'restorasi vespa klasik px150',
            draft_title: 'Restorasi Vespa Klasik PX 150 & Panduan Suku Cadang',
            metrics: {
              ...INITIAL_AUDIT_TURN_2.metrics,
              content_differentiation_score: 82.0,
            },
          },
        },
      ]);
    }
  };

  const handleNewAnalysis = () => {
    setActiveSessionId('session-new');
    setCurrentTurns([]);
    setTargetQuery('');
    setDraftInput('');
    setIsTransitioningToDock(false);
  };

  const isCurrentPinned =
    sessions.find((s) => s.session_id === activeSessionId)?.is_pinned ?? false;

  const currentWordCount = countPureWords(draftInput);
  const isComposerCentered =
    (activeSessionId === 'session-new' || currentTurns.length === 0) && !isTransitioningToDock;

  return (
    <div
      style={{
        width: '100vw',
        height: isDesktop ? '100vh' : '100%',
        maxHeight: isDesktop ? '100vh' : '100dvh',
        overflow: 'hidden',
        position: 'relative',
        background: COLORS.warmCream,
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* GUEST MODE VIEW */}
      {!isAuthenticated && (
        <>
          <GuestSidebar
            isDesktop={isDesktop}
            isOpen={isSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            onClose={() => setIsSidebarOpen(false)}
            onToggleCollapse={handleToggleCollapse}
            sidebarToggleId="guest-sidebar-toggle"
            onSignIn={() => {
              setIsAuthenticated(true);
              setIsSidebarOpen(false);
              showToast({
                type: 'success',
                title: 'Selamat Datang',
                message: 'Berhasil masuk ke Dashboard Member Waskita.',
              });
            }}
            onNewChat={handleNewAnalysis}
            onToggleTheme={toggleTheme}
          />

          <GuestWorkspace
            isDesktop={isDesktop}
            isSidebarCollapsed={isSidebarCollapsed}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onToggleSidebar={handleToggleCollapse}
            onOpenPlus={() => setIsOptionsOpen(true)}
            onSignIn={() => {
              setIsAuthenticated(true);
              showToast({
                type: 'success',
                title: 'Selamat Datang',
                message: 'Berhasil masuk ke Dashboard Member Waskita.',
              });
            }}
            draftText={draftInput}
            onDraftTextChange={setDraftInput}
            onSubmit={() => handleExecuteAudit()}
            isLoading={isLoading}
            onSelectSampleDraft={handleSelectSampleDraft}
          />
        </>
      )}

      {/* AUTHENTICATED MEMBER MODE VIEW */}
      {isAuthenticated && (
        <>
          {/* Sidebar */}
          <AuthSidebar
            isDesktop={isDesktop}
            isOpen={isSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            onClose={() => setIsSidebarOpen(false)}
            onToggleCollapse={handleToggleCollapse}
            onSwitchAccount={() => setAuthModalOpen(true)}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewAnalysis={handleNewAnalysis}
            onToggleTheme={toggleTheme}
            onSignOut={() => {
              setIsAuthenticated(false);
              waskitaClient.setToken(null);
              localStorage.removeItem('waskita_token');
              showToast({
                type: 'info',
                title: 'Keluar',
                message: 'Anda kembali ke Mode Tamu.',
              });
            }}
            onRenameSession={handleRenameClick}
            onPinSession={handlePin}
            onDeleteSession={handleDeleteClick}
            onExportSession={handleExportSessionById}
          />

          {/* Right Column (Header + Stream + Composer) */}
          <div
            style={{
              flex: 1,
              height: isDesktop ? '100vh' : '100%',
              maxHeight: isDesktop ? '100vh' : '100dvh',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Header with 7 SVG Actions */}
            <AuthHeader
              isDesktop={isDesktop}
              isSidebarCollapsed={isSidebarCollapsed}
              hasActiveSession={currentTurns.length > 0 && activeSessionId !== 'session-new'}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onToggleSidebar={handleToggleCollapse}
              onNewAnalysis={handleNewAnalysis}
              onCopyRemediationPrompt={handleCopyRemediationPrompt}
              onCopySummary={handleCopySummary}
              onDownloadReport={handleDownloadReport}
              onCopyDraft={handleCopyDraft}
              onShare={handleShare}
              onPin={() => handlePin()}
              isPinned={isCurrentPinned}
              onRename={() => handleRenameClick()}
              onDelete={() => handleDeleteClick()}
            />

            {/* Scrollable Main Stream Area */}
            <main
              style={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                boxSizing: 'border-box',
                paddingBottom: isComposerCentered
                  ? '0px'
                  : isDesktop
                  ? '130px'
                  : '150px',
              }}
            >
              {isComposerCentered ? (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: isDesktop ? '0 24px 32px 24px' : '16px 14px 24px 14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <NewAnalysisEmptyView isDesktop={isDesktop} />
                  {/* Komposer Terpadu mode centered di bawah hero */}
                  <div style={{ width: '100%', maxWidth: '820px' }}>
                    <FloatingComposerDock
                      isDesktop={isDesktop}
                      layoutMode="centered"
                      onOpenPlus={() => setIsOptionsOpen(true)}
                      draftText={draftInput}
                      onDraftTextChange={setDraftInput}
                      onSubmit={() => handleExecuteAudit()}
                      isLoading={isLoading}
                      wordCount={currentWordCount}
                      minWordCount={300}
                      isPlusGlowing={isPlusGlowing}
                      detectedKeywordHint={detectedKeywordHint}
                      onPasteSanitized={handlePasteSanitized}
                      onSelectSampleDraft={handleSelectSampleDraft}
                      activeTurnNumber={activeSessionId !== 'session-new' && currentTurns.length > 0 ? currentTurns.length + 1 : undefined}
                      activeTargetQuery={targetQuery}
                      targetQuery={targetQuery}
                      onTargetQueryChange={setTargetQuery}
                      thresholds={thresholds}
                    />
                  </div>
                </div>
              ) : (
                <MultiTurnAuditStreamView
                  isDesktop={isDesktop}
                  historyTurns={currentTurns}
                  isLoading={isLoading}
                  currentStep={stepperStep}
                  statusMessage={stepperMessage}
                  isStepperFadingOut={isStepperFadingOut}
                  onSelectForPrint={(aud) => setPrintAuditData(aud)}
                />
              )}
            </main>

            {/* Floating Composer Dock Melayang Permanen di Bawah Viewport (Docked Mode) */}
            {!isComposerCentered && (
              <FloatingComposerDock
                isDesktop={isDesktop}
                layoutMode="docked"
                onOpenPlus={() => setIsOptionsOpen(true)}
                draftText={draftInput}
                onDraftTextChange={setDraftInput}
                onSubmit={() => handleExecuteAudit()}
                isLoading={isLoading}
                wordCount={currentWordCount}
                minWordCount={300}
                isPlusGlowing={isPlusGlowing}
                detectedKeywordHint={detectedKeywordHint}
                onPasteSanitized={handlePasteSanitized}
                onSelectSampleDraft={handleSelectSampleDraft}
                activeTurnNumber={activeSessionId !== 'session-new' && currentTurns.length > 0 ? currentTurns.length + 1 : undefined}
                activeTargetQuery={targetQuery}
                targetQuery={targetQuery}
                onTargetQueryChange={setTargetQuery}
                thresholds={thresholds}
              />
            )}
          </div>
        </>
      )}

      {/* Options Overlay with 4 Range Sliders & File Uploader */}
      <AuditOptionsOverlay
        isDesktop={isDesktop}
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        targetQuery={targetQuery}
        onTargetQueryChange={setTargetQuery}
        thresholds={thresholds}
        onThresholdsChange={handleThresholdsChange}
        onFileUpload={handleFileUpload}
      />

      {/* Rename Modal */}
      <ConfirmModal
        isOpen={renameModalOpen}
        title="Ganti Judul Analisis"
        message="Masukkan judul baru untuk sesi analisis ini:"
        confirmLabel="Simpan Judul"
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameModalOpen(false)}
      >
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--waskita-card, #E9DFCA)',
            border: '1px solid var(--waskita-border-strong, rgba(30, 41, 59, 0.15))',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '13px',
            color: COLORS.deepSlate,
            outline: 'none',
            marginTop: '8px',
            boxSizing: 'border-box',
          }}
        />
      </ConfirmModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Hapus Riwayat Analisis?"
        message="Apakah Anda yakin ingin menghapus riwayat analisis ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Auth Modal for Sign in / Demo Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
        }}
      />

      {/* Print View Komponen Vektor A4 (Standar PZN) */}
      <ExecutiveAuditPrintReport
        auditData={
          printAuditData ||
          (currentTurns.length > 0
            ? currentTurns[currentTurns.length - 1].auditResult
            : null)
        }
        draftContent={
          currentTurns.length > 0
            ? currentTurns[currentTurns.length - 1].draftContent
            : draftInput
        }
      />
    </div>
  );
};

export default App;
