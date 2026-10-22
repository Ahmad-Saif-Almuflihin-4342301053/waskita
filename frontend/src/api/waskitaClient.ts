import {
  AuditExecuteRequest,
  AuditExecuteResponse,
  AuditSessionSummary,
  ExtractFileResponse,
} from '../types/waskita';

const BASE_URL = import.meta.env.VITE_API_URL || '';

class WaskitaApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      ...extraHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * POST /api/v1/audit/execute
   * Eksekusi audit kualitas naskah draf terhadap kompetitor SERP
   */
  async executeAudit(request: AuditExecuteRequest): Promise<AuditExecuteResponse> {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/audit/execute`, {
        method: 'POST',
        headers: this.getHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            `Gagal melakukan audit (HTTP ${res.status}: ${res.statusText})`
        );
      }

      return await res.json();
    } catch (err: any) {
      // Fallback dummy simulation if backend is not reachable in dev
      console.warn('Backend unreachable or error, checking fallback:', err.message);
      throw err;
    }
  }

  /**
   * POST /api/v1/audit/extract-file
   * Ekstraksi naskah draf dari file .md, .txt, .docx
   */
  async extractFile(file: File): Promise<ExtractFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/api/v1/audit/extract-file`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Ekstraksi berkas gagal (HTTP ${res.status}: ${res.statusText})`
      );
    }

    return await res.json();
  }

  /**
   * GET /api/v1/sessions
   * Daftar sesi riwayat pengguna
   */
  async getSessions(query?: string, pinned?: boolean): Promise<AuditSessionSummary[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (pinned !== undefined) params.append('pinned', String(pinned));

    const res = await fetch(`${BASE_URL}/api/v1/sessions?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Gagal memuat sesi (HTTP ${res.status}: ${res.statusText})`
      );
    }

    return await res.json();
  }

  /**
   * GET /api/v1/sessions/{id}
   */
  async getSessionDetail(sessionId: string): Promise<AuditExecuteResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/sessions/${sessionId}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Gagal memuat detail sesi (HTTP ${res.status}: ${res.statusText})`
      );
    }

    return await res.json();
  }

  /**
   * PATCH /api/v1/sessions/{id}
   * Update title / pinned status
   */
  async updateSession(
    sessionId: string,
    updates: { draft_title?: string; is_pinned?: boolean }
  ): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/v1/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: this.getHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Gagal memperbarui sesi (HTTP ${res.status}: ${res.statusText})`
      );
    }

    return await res.json();
  }

  /**
   * DELETE /api/v1/sessions/{id}
   */
  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Gagal menghapus sesi (HTTP ${res.status}: ${res.statusText})`
      );
    }
  }

  /**
   * GET /api/v1/sessions/{id}/export?format={format}
   */
  async exportSession(sessionId: string, format: 'json' | 'md' | 'csv' | 'pdf'): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/api/v1/sessions/${sessionId}/export?format=${format}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Gagal mengekspor riwayat (HTTP ${res.status})`);
    }

    return await res.blob();
  }
}

export const waskitaClient = new WaskitaApiClient();
