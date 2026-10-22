import React, { useState, useEffect } from 'react';
import { COLORS } from './components/shared-ui';
import { GuestSidebar } from './components/guest-sidebar';
import { GuestWorkspace } from './components/guest-workspace';
import {
  AuthSidebar,
  AuthHeader,
  FloatingComposerDock,
} from './components/auth-sidebar-header';
import { NewAnalysisEmptyView } from './components/auth-audit-views';
import { MultiTurnAuditStreamView } from './components/MultiTurnAuditStreamView';
import { AuditOptionsOverlay } from './components/AuditOptionsOverlay';
import { ConfirmModal } from './components/ConfirmModal';
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

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  // Mode: Guest vs Authenticated (Member)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

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
        'Kopi tubruk adalah minuman khas Indonesia yang dibuat dengan menyeduh bubuk kopi secara langsung tanpa disaring...',
      auditResult: INITIAL_AUDIT_TURN_1,
    },
    {
      draftTitle: 'Resep Kopi Tubruk Tradisional & Takaran Pas (Revisi #2)',
      draftContent:
        'Menikmati seduhan kopi tubruk sejatinya merayakan kesederhanaan rasa yang jujur...',
      auditResult: INITIAL_AUDIT_TURN_2,
    },
  ]);

  // Input composer draft state
  const [draftInput, setDraftInput] = useState<string>('');
  const [targetQuery, setTargetQuery] = useState<string>('resep kopi tubruk tradisional');
  const [thresholds, setThresholds] = useState<QualityThresholds>({
    max_cosine_similarity: 0.60,
    min_mattr: 0.55,
    max_hko_percentage: 40.0,
    min_cds_score: 75.0,
  });

  // UI Drawer & Popover toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);

  // Stepper state for live audit submit
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stepperStep, setStepperStep] = useState<number>(1);
  const [stepperMessage, setStepperMessage] = useState<string>('');

  // Confirmation Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');

  // 1. Submit Audit with 5-stage Live Stepper
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

    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount < 10) {
      showToast({
        type: 'warning',
        title: 'Naskah Terlalu Singkat',
        message: `Naskah baru memiliki ${wordCount} kata. Minimal panjang teks untuk audit adalah 300 kata (disarankan).`,
      });
    }

    setIsLoading(true);
    setStepperStep(1);
    setStepperMessage('Memeriksa panjang kata, struktur heading, dan integritas naskah...');

    const stepTimer1 = setTimeout(() => {
      setStepperStep(2);
      setStepperMessage('Mengakuisisi korpus 3 artikel kompetitor teratas di Google SERP...');
    }, 1100);

    const stepTimer2 = setTimeout(() => {
      setStepperStep(3);
      setStepperMessage('Menjalankan tokenisasi, stemming Sastrawi, dan eliminasi stopwords...');
    }, 2200);

    const stepTimer3 = setTimeout(() => {
      setStepperStep(4);
      setStepperMessage('Mengukur Cosine Similarity VSM & Information Gain (Δ-loss / Δ-gain)...');
    }, 3300);

    const stepTimer4 = setTimeout(() => {
      setStepperStep(5);
      setStepperMessage('Menyusun skor akhir CDS dan diagnostik stabilo per kalimat...');
    }, 4400);

    try {
      const parentSession = currentTurns.length > 0 ? currentTurns[currentTurns.length - 1].auditResult.session_id : null;
      let result: AuditExecuteResponse;

      try {
        result = await waskitaClient.executeAudit({
          target_query: targetQuery,
          draft_title: `Draf Naskah: ${targetQuery.substring(0, 30)}...`,
          draft_content: content,
          parent_session_id: parentSession,
          use_cached_serp: true,
          thresholds,
        });
      } catch (err: any) {
        // Fallback simulation when backend server is offline/dev
        await new Promise((r) => setTimeout(r, 4800));
        const newScore = Math.min(
          95,
          currentTurns.length > 0
            ? Math.round(currentTurns[currentTurns.length - 1].auditResult.metrics.content_differentiation_score + 15)
            : 70
        );
        const verdict = newScore >= thresholds.min_cds_score ? 'Layak Terbit' : 'Perlu Revisi';

        result = {
          session_id: 'session-' + Math.random().toString(36).substring(2, 9),
          parent_session_id: parentSession,
          turn_number: currentTurns.length + 1,
          target_query: targetQuery,
          draft_title: `Revisi #${currentTurns.length + 1} - ${targetQuery}`,
          draft_word_count: wordCount,
          audit_timestamp: new Date().toISOString(),
          verdict_status: verdict,
          degradation_warning: null,
          thresholds,
          metrics: {
            content_differentiation_score: newScore,
            avg_cosine_similarity: 0.42,
            max_cosine_similarity: newScore >= thresholds.min_cds_score ? 0.48 : 0.68,
            euclidean_distance: 1.15,
            ttr_score: 0.58,
            mattr_score: newScore >= thresholds.min_cds_score ? 0.62 : 0.49,
            hko_percentage: newScore >= thresholds.min_cds_score ? 20.0 : 45.0,
            is_redundant: newScore < thresholds.min_cds_score,
            is_keyword_stuffed: newScore < thresholds.min_cds_score,
          },
          entity_gaps: {
            deficit: newScore >= thresholds.min_cds_score ? [] : [
              { term_string: 'rasio seduh', term_surface_form: 'Rasio Seduh 1:15', tfidf_weight: 0.8, competitor_consensus_count: 2 },
            ],
            gain: [
              { term_string: 'analisis unik', term_surface_form: 'Cita Rasa Lokal Khas', tfidf_weight: 0.9, competitor_consensus_count: 0 },
            ],
          },
          annotated_spans: [
            { text: content.slice(0, 120), color: newScore >= thresholds.min_cds_score ? 'green' : 'yellow', label: newScore >= thresholds.min_cds_score ? 'Orisinalitas Kuat' : 'Klise/Generik' },
            { text: content.slice(120, 240) || 'Paragraf penjelasan tambahan...', color: 'blue', label: 'Saran Celah Defisit' },
            { text: content.slice(240) || 'Paragraf penutup naskah...', color: newScore >= thresholds.min_cds_score ? 'green' : 'red', label: newScore >= thresholds.min_cds_score ? 'Orisinalitas Kuat' : 'Redundansi VSM Tinggi' },
          ],
          overview_bullets: [
            `Audit selesai dengan skor diferensiasi konten ${newScore}%.`,
            verdict === 'Layak Terbit'
              ? 'Naskah telah memenuhi ambang batas kualitas artikel kompetitif.'
              : 'Disarankan memperkaya variasi kosakata dan menutup celah defisit topik.',
          ],
          remediation_prompt: `Perbaiki gaya bahasa naskah '${targetQuery}' dengan memprioritaskan entitas unik.`,
        };
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      setCurrentTurns((prev) => [
        ...prev,
        {
          draftTitle: result.draft_title,
          draftContent: content,
          auditResult: result,
        },
      ]);

      // If active session was 'new', make it active
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
        message: `Hasil analisis #${result.turn_number} siap: CDS ${Math.round(result.metrics.content_differentiation_score)}% (${result.verdict_status})`,
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
      setStepperStep(1);
      setStepperMessage('');
    }
  };

  // 2. File Uploader Handler (.md, .txt, .docx)
  const handleFileUpload = async (file: File) => {
    try {
      showToast({
        type: 'info',
        title: 'Mengekstrak Berkas',
        message: `Mengunggah berkas ${file.name}...`,
      });

      let extracted = '';
      try {
        const res = await waskitaClient.extractFile(file);
        extracted = res.extracted_text;
      } catch {
        // Client-side text read fallback
        extracted = await file.text();
      }

      setDraftInput(extracted);
      setIsOptionsOpen(false);
      showToast({
        type: 'success',
        title: 'Berkas Berhasil Dimuat',
        message: `Naskah (${extracted.split(/\s+/).length} kata) siap diaudit.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Ekstraksi Gagal',
        message: err.message || 'Gagal membaca berkas yang diunggah.',
      });
    }
  };

  // 3. Header Action Handlers
  const handleCopySummary = () => {
    if (currentTurns.length === 0) return;
    const latest = currentTurns[currentTurns.length - 1].auditResult;
    const summary = `[WASKITA AUDIT REPORT]
Judul: ${latest.draft_title}
Kueri: ${latest.target_query}
Status: ${latest.verdict_status}
Skor CDS: ${Math.round(latest.metrics.content_differentiation_score)}% (Ambang: ${thresholds.min_cds_score}%)
Max Cosine: ${latest.metrics.max_cosine_similarity.toFixed(2)}
MATTR: ${latest.metrics.mattr_score.toFixed(2)}
HKO Overlap: ${Math.round(latest.metrics.hko_percentage)}%
Rekomendasi:\n${latest.overview_bullets.map((b) => `- ${b}`).join('\n')}`;

    navigator.clipboard.writeText(summary);
    showToast({
      type: 'success',
      title: 'Tersalin',
      message: 'Ringkasan hasil analisis disalin ke papan klip.',
    });
  };

  const handleDownloadReport = async () => {
    if (currentTurns.length === 0) return;
    const latest = currentTurns[currentTurns.length - 1].auditResult;
    const reportMd = `# Laporan Audit Orisinalitas Konten Waskita
**Judul Artikel:** ${latest.draft_title}  
**Kueri Target:** \`${latest.target_query}\`  
**Waktu Audit:** ${new Date(latest.audit_timestamp).toLocaleString('id-ID')}  
**Status Kelayakan:** ${latest.verdict_status} (CDS: ${Math.round(latest.metrics.content_differentiation_score)}%)

---

## 1. Ringkasan Metrik
- **Kemiripan Kosinus Maksimal (VSM):** ${latest.metrics.max_cosine_similarity.toFixed(2)}
- **Kekayaan Kosakata (MATTR):** ${latest.metrics.mattr_score.toFixed(2)}
- **Tumpang-tindih Heading (HKO):** ${Math.round(latest.metrics.hko_percentage)}%

## 2. Diagnostik Rekomendasi
${latest.overview_bullets.map((b) => `- ${b}`).join('\n')}

## 3. Remediasi Prompt LLM
\`\`\`
${latest.remediation_prompt}
\`\`\`
`;

    const blob = new Blob([reportMd], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waskita-audit-${latest.session_id.substring(0, 8)}.md`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Laporan Diunduh',
      message: 'Berkas laporan .md berhasil diunduh ke perangkat Anda.',
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

  const handlePin = () => {
    setSessions((prev) =>
      prev.map((s) => (s.session_id === activeSessionId ? { ...s, is_pinned: !s.is_pinned } : s))
    );
    showToast({
      type: 'success',
      title: 'Status Disematkan',
      message: 'Status pin analisis berhasil diperbarui.',
    });
  };

  const handleRenameClick = () => {
    const cur = sessions.find((s) => s.session_id === activeSessionId);
    setRenameValue(cur?.draft_title || '');
    setRenameModalOpen(true);
  };

  const handleRenameConfirm = () => {
    if (!renameValue.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.session_id === activeSessionId ? { ...s, draft_title: renameValue.trim() } : s))
    );
    setRenameModalOpen(false);
    showToast({
      type: 'success',
      title: 'Judul Diperbarui',
      message: 'Judul sesi analisis berhasil diubah.',
    });
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setSessions((prev) => prev.filter((s) => s.session_id !== activeSessionId));
    setActiveSessionId('session-new');
    setCurrentTurns([]);
    setDeleteModalOpen(false);
    showToast({
      type: 'info',
      title: 'Riwayat Dihapus',
      message: 'Sesi analisis telah dihapus dari daftar riwayat.',
    });
  };

  const handleNewAnalysis = () => {
    setActiveSessionId('session-new');
    setCurrentTurns([]);
    setDraftInput('');
  };

  const isCurrentPinned = sessions.find((s) => s.session_id === activeSessionId)?.is_pinned ?? false;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
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
          <GuestWorkspace
            isDesktop={isDesktop}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenPlus={() => setIsOptionsOpen(true)}
            onSignIn={() => {
              setIsAuthenticated(true);
              showToast({
                type: 'success',
                title: 'Masuk Berhasil',
                message: 'Selamat datang di Ruang Kerja Terautentikasi Waskita.',
              });
            }}
            draftText={draftInput}
            onDraftTextChange={setDraftInput}
            onSubmit={() => handleExecuteAudit()}
            isLoading={isLoading}
          />

          <GuestSidebar
            isDesktop={isDesktop}
            sidebarToggleId="guest-sidebar-toggle"
            onSignIn={() => setIsAuthenticated(true)}
            onNewChat={handleNewAnalysis}
            onToggleTheme={toggleTheme}
          />
        </>
      )}

      {/* AUTHENTICATED MODE VIEW */}
      {isAuthenticated && (
        <>
          {/* Sidebar */}
          <AuthSidebar
            isDesktop={isDesktop}
            sidebarToggleId="auth-sidebar-toggle-desktop"
            activeSessionRadioName="active-session"
            sessionNewId="session-new"
            sessionOneId="session-1"
            sessionTwoId="session-2"
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              if (id === 'session-1') {
                setCurrentTurns([
                  {
                    draftTitle: 'Resep Kopi Tubruk Tradisional & Takaran Pas',
                    draftContent: 'Kopi tubruk adalah minuman khas Indonesia...',
                    auditResult: INITIAL_AUDIT_TURN_1,
                  },
                  {
                    draftTitle: 'Resep Kopi Tubruk Tradisional & Takaran Pas (Revisi #2)',
                    draftContent: 'Menikmati seduhan kopi tubruk...',
                    auditResult: INITIAL_AUDIT_TURN_2,
                  },
                ]);
              } else if (id === 'session-2') {
                setCurrentTurns([
                  {
                    draftTitle: 'Restorasi Vespa Klasik PX 150 & Panduan Suku Cadang',
                    draftContent: 'Restorasi skuter klasik memerlukan ketelitian...',
                    auditResult: {
                      ...INITIAL_AUDIT_TURN_2,
                      session_id: 'session-2',
                      draft_title: 'Restorasi Vespa Klasik PX 150 & Panduan Suku Cadang',
                      metrics: {
                        ...INITIAL_AUDIT_TURN_2.metrics,
                        content_differentiation_score: 82.0,
                      },
                    },
                  },
                ]);
              }
            }}
            onNewAnalysis={handleNewAnalysis}
            onToggleTheme={toggleTheme}
            onSignOut={() => {
              setIsAuthenticated(false);
              showToast({
                type: 'info',
                title: 'Keluar',
                message: 'Anda kembali ke Mode Tamu.',
              });
            }}
          />

          {/* Right Column (Header + Stream + Composer) */}
          <div
            style={{
              flex: 1,
              height: '100vh',
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
              sidebarToggleId="auth-sidebar-toggle-desktop"
              headerMenuToggleId="auth-header-menu-toggle-desktop"
              onCopySummary={handleCopySummary}
              onDownloadReport={handleDownloadReport}
              onCopyDraft={handleCopyDraft}
              onShare={handleShare}
              onPin={handlePin}
              isPinned={isCurrentPinned}
              onRename={handleRenameClick}
              onDelete={handleDeleteClick}
            />

            {/* Scrollable Main Stream Area */}
            <main
              style={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              {activeSessionId === 'session-new' || currentTurns.length === 0 ? (
                <NewAnalysisEmptyView
                  isDesktop={isDesktop}
                  plusToggleId="auth-plus-toggle-desktop"
                />
              ) : (
                <MultiTurnAuditStreamView
                  isDesktop={isDesktop}
                  historyTurns={currentTurns}
                  isLoading={isLoading}
                  currentStep={stepperStep}
                  statusMessage={stepperMessage}
                />
              )}
            </main>

            {/* Floating Composer Dock Melayang di Bawah */}
            <FloatingComposerDock
              isDesktop={isDesktop}
              plusToggleId="auth-plus-toggle-desktop"
              onOpenPlus={() => setIsOptionsOpen(true)}
              draftText={draftInput}
              onDraftTextChange={setDraftInput}
              onSubmit={() => handleExecuteAudit()}
              isLoading={isLoading}
            />
          </div>
        </>
      )}

      {/* Options Overlay with 4 Range Sliders & File Uploader */}
      <AuditOptionsOverlay
        toggleId="auth-plus-toggle-desktop"
        isDesktop={isDesktop}
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        targetQuery={targetQuery}
        onTargetQueryChange={setTargetQuery}
        thresholds={thresholds}
        onThresholdsChange={setThresholds}
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
    </div>
  );
};

export default App;
