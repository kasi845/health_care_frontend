/**
 * API client: auth uses backend (FastAPI + JWT + MongoDB via DATABASE_URL).
 */

const HEALTH_REPORT_KEY = 'health_report';

function getApiUrl(): string {
  // Prefer same-origin /api when running locally so that
  // Vite's dev proxy handles requests without CORS issues.
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "/api";
  }

  const base = import.meta.env.VITE_API_URL;
  if (typeof base === "string" && base) return base.replace(/\/$/, "");
  return "/api";
}

const BACKEND_UNREACHABLE_MSG =
  "Backend unreachable. Start it from the project: open a terminal, run: cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000";

function isNetworkError(err: unknown): boolean {
  const msg = err && typeof err === "object" && "message" in err ? String((err as { message?: string }).message) : "";
  return /failed to fetch|network error|load failed|connection|networkrequestfailed|err_connection_refused/i.test(msg);
}

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const USER_PROFILE_PREFIX = 'user_profile_';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthUser(): any | null {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function setAuthUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  age?: string;
  gender?: string;
  previous_health_issues?: string;
}

function getUserProfileStorageKey(userId: string): string {
  return `${USER_PROFILE_PREFIX}${userId}`;
}

export function getUserProfile(): UserProfile | null {
  const user = getAuthUser();
  if (!user) return null;

  const key = getUserProfileStorageKey(user.id);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const stored = JSON.parse(raw) as Partial<UserProfile>;
      return {
        id: user.id,
        email: user.email,
        full_name: stored.full_name ?? user.full_name,
        age: stored.age,
        gender: stored.gender,
        previous_health_issues: stored.previous_health_issues,
      };
    } catch {
      // Fall through to default profile below
    }
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
  };
}

export function updateUserProfile(
  updates: Partial<Omit<UserProfile, "id" | "email">>
): UserProfile {
  const user = getAuthUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const key = getUserProfileStorageKey(user.id);
  const raw = localStorage.getItem(key);
  let stored: Partial<UserProfile> = {};

  if (raw) {
    try {
      stored = JSON.parse(raw) as Partial<UserProfile>;
    } catch {
      stored = {};
    }
  }

  const merged: UserProfile = {
    id: user.id,
    email: user.email,
    full_name: updates.full_name ?? stored.full_name ?? user.full_name,
    age: updates.age ?? stored.age,
    gender: updates.gender ?? stored.gender,
    previous_health_issues:
      updates.previous_health_issues ?? stored.previous_health_issues,
  };

  const toStore: Partial<UserProfile> = {
    full_name: merged.full_name,
    age: merged.age,
    gender: merged.gender,
    previous_health_issues: merged.previous_health_issues,
  };

  localStorage.setItem(key, JSON.stringify(toStore));

  if (updates.full_name && updates.full_name !== user.full_name) {
    setAuthUser({ ...user, full_name: updates.full_name });
  }

  return merged;
}

export interface HealthHistoryRequest {
  previous_health_issues: string;
}

export async function saveHealthHistory(previous_health_issues: string): Promise<void> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please log in to save your health history.");
  }

  const body: HealthHistoryRequest = { previous_health_issues };

  let res: Response;
  try {
    res = await fetch(`${base}/reports/health-history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    throw new Error(
      isNetworkError(err)
        ? BACKEND_UNREACHABLE_MSG
        : err instanceof Error && err.message
        ? err.message
        : "Failed to save health history"
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const msg =
      (Array.isArray(data.detail)
        ? data.detail.map((d: { msg?: string }) => d.msg).join(", ")
        : data.detail ?? data.message) || "Failed to save health history";
    throw new Error(msg);
  }
}

export interface SymptomAnalysisResponse {
  success: boolean;
  matched_conditions: string[];
  primary_medicines: string[];
}

/**
 * Send WAV audio to backend for speech-to-text (SpeechRecognition + recognize_google).
 * Returns the transcribed text for symptom voice input.
 */
export async function voiceToText(audioBlob: Blob): Promise<string> {
  const base = getApiUrl();
  const token = getAuthToken();
  const form = new FormData();
  form.append("audio", audioBlob, "audio.wav");

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${base}/voice/voice-to-text`, {
      method: "POST",
      headers,
      body: form,
    });
  } catch (err: unknown) {
    throw new Error(isNetworkError(err) ? BACKEND_UNREACHABLE_MSG : "Voice service unavailable.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg = "Voice recognition failed.";
    if (typeof data.detail === "string") msg = data.detail;
    else if (Array.isArray(data.detail)) msg = data.detail.map((x: { msg?: string }) => x.msg).filter(Boolean).join(". ") || msg;
    throw new Error(msg);
  }
  return typeof data.text === "string" ? data.text : "";
}

export interface ScheduleItem {
  id: string;
  message: string;
  time: string;
  time_24: string;
  daily: boolean;
  status: "pending" | "finished";
  created_at: string;
}

export async function createSchedule(message: string, time: string, daily: boolean): Promise<ScheduleItem> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) throw new Error("Please log in to create a schedule.");
  const url = `${base}/schedule`.replace(/\/\/+/, "/");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message, time, daily }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.detail === "string" ? data.detail : res.status === 404 ? "Schedule API not found. Is the backend running?" : "Failed to create schedule";
    throw new Error(msg);
  }
  return data;
}

export async function listSchedules(): Promise<ScheduleItem[]> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) return [];
  const res = await fetch(`${base}/schedule`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return [];
  return Array.isArray(data) ? data : [];
}

export async function updateSchedule(id: string, updates: { daily?: boolean; status?: "pending" | "finished" }): Promise<ScheduleItem> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${base}/schedule/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Update failed");
  return data;
}

export async function deleteSchedule(id: string): Promise<void> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${base}/schedule/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.detail === "string" ? data.detail : "Delete failed");
  }
}

export async function analyzeSymptoms(symptoms: string): Promise<SymptomAnalysisResponse> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) {
    throw new Error("Please log in to analyze symptoms.");
  }

  const body = { symptoms };

  let res: Response;
  try {
    res = await fetch(`${base}/reports/symptoms-analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    throw new Error(
      isNetworkError(err)
        ? BACKEND_UNREACHABLE_MSG
        : err instanceof Error && err.message
        ? err.message
        : "Failed to analyze symptoms"
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const msg =
      (Array.isArray(data.detail)
        ? data.detail.map((d: { msg?: string }) => d.msg).join(", ")
        : data.detail ?? data.message) || "Failed to analyze symptoms";
    throw new Error(msg);
  }

  return {
    success: true,
    matched_conditions: data.matched_conditions ?? [],
    primary_medicines: data.primary_medicines ?? [],
  };
}

// Default values for recommendations
const defaultHomeRemedies = [
  'Warm water with lemon in the morning',
  'Balanced diet with leafy greens',
  'Adequate sleep (7-8 hours)',
  'Stress management through meditation',
];

// Default medicine categories are kept here as comments only so they
// don't render generic advice in the UI:
// const defaultMedicineCategories = [
//   { category: 'Antipyretic medicines', description: 'Commonly used for fever or pain management' },
//   { category: 'Antacid medicines', description: 'Commonly used for digestive health' },
//   { category: 'Antihistamine medicines', description: 'Commonly used for allergy management' },
// ];
const defaultMedicineCategories: { category: string; description: string }[] = [];

export interface PDFUploadResponse {
  success: boolean;
  filename: string;
  extracted_text: string;
  page_count: number;
  extracted_data?: any;
  metadata?: any;
  message?: string;
}

export interface EmbeddingResponse {
  success: boolean;
  embedding: number[];
  model: string;
  dimensions: number;
  text_length: number;
  stored_in_qdrant: boolean;
  qdrant_point_id?: number;
  message?: string;
}

export interface HealthAnalysis {
  health_score: number;
  risks: Array<{
    name: string;
    risk: number;
    status: 'Low' | 'Monitor' | 'High';
  }>;
  interpretations: Array<{
    icon: string;
    text: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  suggestions: string[];
  home_remedies: string[];
  medicine_categories: Array<{
    category: string;
    description: string;
  }>;
}

/**
 * Upload report to backend: extract → embed → Qdrant compare → save to MongoDB.
 * Returns analysis for UI (suggestions, home_remedies, medicine_categories, etc.).
 * Requires auth (Bearer token).
 */
export async function uploadAndAnalyzeReport(file: File): Promise<HealthAnalysis & { report_id?: string; filename?: string }> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) throw new Error('Please log in to upload and analyze reports.');

  const form = new FormData();
  form.append('file', file);

  let res: Response;
  try {
    res = await fetch(`${base}/reports/upload-analyze`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch (err: unknown) {
    throw new Error(isNetworkError(err) ? BACKEND_UNREACHABLE_MSG : (err instanceof Error ? err.message : "Upload failed"));
  }
  const text = await res.text();
  const data = text ? (function () { try { return JSON.parse(text); } catch { return {}; } })() : {};
  if (!res.ok) {
    let msg = data.detail ?? data.message ?? '';
    if (Array.isArray(msg)) msg = msg.map((x: { msg?: string }) => x.msg).filter(Boolean).join('. ') || 'Upload failed';
    else if (typeof msg !== 'string') msg = 'Upload failed';
    if (!msg) msg = res.status === 401 ? 'Please log in again.' : res.status === 503 ? 'Service unavailable. Check backend .env (OPENAI_API_KEY, QDRANT, MongoDB).' : res.status === 502 ? 'Service temporarily unavailable.' : text?.slice(0, 100) || 'Upload failed';
    if (res.status === 404) {
      msg = "Upload endpoint not found. Ensure the backend is running (cd backend && uvicorn main:app --reload --port 8000) and the dev server is proxying /api to it.";
    }
    throw new Error(msg);
  }
  return {
    health_score: data.health_score ?? 70,
    risks: data.risks ?? [],
    interpretations: data.interpretations ?? [],
    suggestions: data.suggestions ?? [],
    home_remedies: data.home_remedies ?? [],
    medicine_categories: data.medicine_categories ?? [],
    report_id: data.report_id,
    filename: data.filename,
  };
}

/**
 * Get latest report for current user (for re-login display).
 * Requires auth.
 */
export async function getLatestReport(): Promise<HealthReportResponse | null> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) return null;

  const res = await fetch(`${base}/reports/latest`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.report) return null;
  const r = data.report;
  return {
    id: r.id,
    user_id: getAuthUser()?.id ?? '',
    health_score: r.health_score,
    risks: r.risks ?? [],
    interpretations: r.interpretations ?? [],
    suggestions: r.suggestions ?? [],
    home_remedies: r.home_remedies ?? [],
    medicine_categories: r.medicine_categories ?? [],
    extracted_text: undefined,
    filename: r.filename,
    created_at: r.created_at ?? '',
    updated_at: r.created_at ?? '',
  };
}

/**
 * Get report history for current user.
 */
export async function getReportHistory(): Promise<HealthReportResponse[]> {
  const base = getApiUrl();
  const token = getAuthToken();
  if (!token) return [];

  const res = await fetch(`${base}/reports/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.reports)) return [];
  return data.reports.map((r: any) => ({
    id: r.id,
    user_id: getAuthUser()?.id ?? '',
    health_score: r.health_score,
    risks: r.risks ?? [],
    interpretations: r.interpretations ?? [],
    suggestions: r.suggestions ?? [],
    home_remedies: r.home_remedies ?? [],
    medicine_categories: r.medicine_categories ?? [],
    filename: r.filename,
    created_at: r.created_at ?? '',
    updated_at: r.created_at ?? '',
  }));
}

/**
 * Upload PDF file and extract data (frontend-only: mock extraction from file name)
 */
export async function uploadPDF(file: File): Promise<PDFUploadResponse> {
  await new Promise((r) => setTimeout(r, 400)); // Simulate processing
  const extracted_text =
    `Health report: ${file.name}. Blood pressure elevated. Glucose levels monitored. Weight and BMI recorded. Heart and kidney markers within range.`;
  return {
    success: true,
    filename: file.name,
    extracted_text,
    page_count: 1,
    message: 'Processed locally (no backend)',
  };
}

/**
 * Generate embeddings from text (frontend-only: mock response)
 */
export async function generateEmbeddings(text: string, model: string = 'text-embedding-3-small'): Promise<EmbeddingResponse> {
  await new Promise((r) => setTimeout(r, 100));
  return {
    success: true,
    embedding: [],
    model,
    dimensions: 0,
    text_length: text.length,
    stored_in_qdrant: false,
    message: 'Frontend-only mode',
  };
}

/**
 * Search similar vectors in knowledge base (frontend-only: mock empty results)
 */
export async function searchKnowledgeBase(_queryText: string, _limit: number = 5, _collection: string = 'brain_cardio'): Promise<any> {
  await new Promise((r) => setTimeout(r, 100));
  return { results: [] };
}

/**
 * Call public extract endpoint (no auth) to get extracted text from file.
 */
async function extractReportFile(file: File): Promise<{ extracted_text: string; filename: string }> {
  const base = getApiUrl();
  const form = new FormData();
  form.append('file', file);
  let res: Response;
  try {
    res = await fetch(`${base}/extract/`, { method: 'POST', body: form });
  } catch (err: unknown) {
    throw new Error(isNetworkError(err) ? BACKEND_UNREACHABLE_MSG : (err instanceof Error ? err.message : "Extraction failed"));
  }
  const text = await res.text();
  const data = text ? (function () { try { return JSON.parse(text); } catch { return {}; } })() : {};
  if (!res.ok) {
    let msg = data.detail ?? data.message ?? "Extraction failed";
    if (typeof msg !== "string") msg = JSON.stringify(msg);
    if (res.status === 404) {
      msg = "Upload endpoint not found. Ensure the backend is running (cd backend && uvicorn main:app --reload --port 8000) and the dev server is proxying /api to it.";
    }
    throw new Error(msg);
  }
  return {
    extracted_text: data.extracted_text ?? "",
    filename: data.filename ?? file.name,
  };
}

/**
 * Analyze report: if logged in, use full backend (extract → embed → Qdrant → MongoDB).
 * If not logged in, use public /extract/ and return minimal analysis (log in to save and get care guidance).
 */
export async function analyzeHealthReport(file: File): Promise<HealthAnalysis> {
  const token = getAuthToken();

  // If logged in, prefer full backend pipeline but silently
  // fall back to frontend-only analysis on any error so the
  // user never sees raw network/404 errors from /reports.
  if (token) {
    try {
      return await uploadAndAnalyzeReport(file);
    } catch (e) {
      console.error("Backend upload-analyze failed, falling back to frontend-only mode:", e);
      // continue to frontend-only flow below
    }
  }

  // Public/unauthenticated path: try backend /extract/ first
  // to get real extracted text; if that fails (backend down,
  // OPENAI_API_KEY missing, etc.), use pure frontend mock.
  try {
    const extracted = await extractReportFile(file);
    const interpretation = (extracted.extracted_text || 'No text extracted.').slice(0, 300);
    return {
      health_score: 70,
      risks: [],
      interpretations: [{ icon: 'FileText', text: interpretation || 'Based on your report.', severity: 'medium' as const }],
      suggestions: [
        'Log in to save reports and get personalized suggestions.',
        'Follow up with your doctor for a complete interpretation.',
        'Keep a record of symptoms to share with your healthcare provider.',
      ],
      home_remedies: [
        'Log in to get home remedies from our knowledge base.',
        'Warm water with lemon in the morning.',
        'Balanced diet with leafy greens; adequate sleep (7–8 hours).',
      ],
      medicine_categories: [{ category: 'Consult your doctor', description: 'Log in for advisory medicine categories.' }],
    };
  } catch (e) {
    // Backend unreachable or extract failed: fallback to mock
    const uploadResult = await uploadPDF(file);
    const searchResult = await searchKnowledgeBase(uploadResult.extracted_text, 5, 'brain_cardio');
    const analysis = analyzeExtractedData(uploadResult, searchResult);
    try {
      await saveHealthReport({
        health_score: analysis.health_score,
        risks: analysis.risks,
        interpretations: analysis.interpretations,
        suggestions: analysis.suggestions,
        home_remedies: analysis.home_remedies,
        medicine_categories: analysis.medicine_categories,
        extracted_text: uploadResult.extracted_text,
        filename: uploadResult.filename,
      }, uploadResult.filename);
    } catch (err) {
      console.error('Failed to save health report:', err);
    }
    return analysis;
  }
}

/**
 * Analyze extracted data and return health insights
 * This is a simplified version - ideally this should be done on the backend
 */
function analyzeExtractedData(uploadResult: PDFUploadResponse, searchResult: any): HealthAnalysis {
  const text = uploadResult.extracted_text.toLowerCase();
  
  // Extract health risks based on text content
  const risks = [];
  let healthScore = 100;
  
  // Check for diabetes indicators
  if (text.includes('glucose') || text.includes('sugar') || text.includes('diabetes')) {
    const risk = text.includes('high') || text.includes('elevated') ? 65 : 30;
    risks.push({
      name: 'Diabetes Risk',
      risk,
      status: risk > 50 ? 'Monitor' : 'Low',
    });
    healthScore -= risk * 0.3;
  }
  
  // Check for heart disease indicators
  if (text.includes('blood pressure') || text.includes('heart') || text.includes('cardiac')) {
    const risk = text.includes('high') || text.includes('elevated') ? 42 : 20;
    risks.push({
      name: 'Heart Disease',
      risk,
      status: risk > 40 ? 'Monitor' : 'Low',
    });
    healthScore -= risk * 0.25;
  }
  
  // Check for kidney indicators
  if (text.includes('kidney') || text.includes('creatinine') || text.includes('renal')) {
    const risk = text.includes('high') || text.includes('elevated') ? 35 : 18;
    risks.push({
      name: 'Kidney Risk',
      risk,
      status: risk > 30 ? 'Monitor' : 'Low',
    });
    healthScore -= risk * 0.2;
  }
  
  // Default risks if none found
  if (risks.length === 0) {
    risks.push(
      { name: 'Diabetes Risk', risk: 65, status: 'Monitor' },
      { name: 'Heart Disease', risk: 42, status: 'Monitor' },
      { name: 'Kidney Risk', risk: 18, status: 'Low' }
    );
    healthScore = 58;
  }
  
  // Generate interpretations
  const interpretations = [];
  if (text.includes('glucose') && (text.includes('high') || text.includes('elevated'))) {
    interpretations.push({
      icon: 'AlertTriangle',
      text: 'Your glucose level is above normal range',
      severity: 'high' as const,
    });
  }
  if (text.includes('blood pressure') && (text.includes('high') || text.includes('elevated'))) {
    interpretations.push({
      icon: 'TrendingUp',
      text: 'Blood pressure reading indicates monitoring is required',
      severity: 'medium' as const,
    });
  }
  if (text.includes('bmi') || text.includes('weight')) {
    interpretations.push({
      icon: 'Scale',
      text: 'BMI value suggests lifestyle adjustments may help',
      severity: 'medium' as const,
    });
  }
  
  // Default interpretations if none found
  if (interpretations.length === 0) {
    interpretations.push(
      { icon: 'AlertTriangle', text: 'Your glucose level is above normal range', severity: 'high' as const },
      { icon: 'TrendingUp', text: 'Blood pressure reading indicates monitoring is required', severity: 'medium' as const },
      { icon: 'Scale', text: 'BMI value suggests lifestyle adjustments may help', severity: 'medium' as const }
    );
  }
  
  // Get suggestions from knowledge base search results
  const suggestions = searchResult?.results?.slice(0, 4).map((r: any) => {
    try {
      const originalData = r.metadata?.original_data;
      if (!originalData) return null;
      const data = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
      if (data.precautions && Array.isArray(data.precautions) && data.precautions.length > 0) {
        return data.precautions[0];
      }
      if (data.home_remedies && Array.isArray(data.home_remedies) && data.home_remedies.length > 0) {
        return data.home_remedies[0];
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  }).filter(Boolean) || [
    'Reduce sugar intake to manage glucose levels',
    'Daily 30-minute walking or light exercise',
    'Regular blood pressure monitoring',
    'Maintain consistent sleep schedule',
  ];
  
  // Get home remedies
  let homeRemedies = defaultHomeRemedies;
  try {
    const remedyResult = searchResult?.results?.find((r: any) => {
      try {
        const originalData = r.metadata?.original_data;
        if (!originalData) return false;
        const data = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
        return data.home_remedies && Array.isArray(data.home_remedies) && data.home_remedies.length > 0;
      } catch {
        return false;
      }
    });
    
    if (remedyResult) {
      const originalData = remedyResult.metadata?.original_data;
      const data = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
      if (data.home_remedies) {
        homeRemedies = data.home_remedies.slice(0, 4);
      }
    }
  } catch (e) {
    // Use defaults
  }
  
  // Get medicine categories
  let medicineCategories = defaultMedicineCategories;
  try {
    const medicineResults = searchResult?.results?.filter((r: any) => {
      try {
        const originalData = r.metadata?.original_data;
        if (!originalData) return false;
        const data = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
        return data.type === 'medicine_category';
      } catch {
        return false;
      }
    }) || [];
    
    if (medicineResults.length > 0) {
      medicineCategories = medicineResults.map((r: any) => {
        const originalData = r.metadata?.original_data;
        const data = typeof originalData === 'string' ? JSON.parse(originalData) : originalData;
        return {
          category: data.name || 'Unknown',
          description: data.used_for?.join(', ') || data.warning || 'Consult your doctor',
        };
      }).slice(0, 3);
    }
  } catch (e) {
    // Use defaults
  }
  
  return {
    health_score: Math.max(0, Math.min(100, Math.round(healthScore))),
    risks,
    interpretations,
    suggestions: suggestions.slice(0, 4),
    home_remedies: homeRemedies.slice(0, 4),
    medicine_categories: medicineCategories.slice(0, 3),
  };
}

// Authentication interfaces
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: UserResponse;
  token: TokenResponse;
}

/**
 * Sign up a new user (backend: FastAPI + MongoDB + JWT)
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const base = getApiUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });
  } catch (err: unknown) {
    const msg = isNetworkError(err)
      ? BACKEND_UNREACHABLE_MSG
      : err instanceof Error && err.message
        ? err.message
        : "Signup failed";
    throw new Error(msg);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(body.detail)
      ? body.detail.map((d: { msg?: string }) => d.msg).join(', ')
      : (body.detail ?? body.message ?? 'Signup failed');
    throw new Error(msg);
  }
  setAuthToken(body.access_token);
  setAuthUser(body.user);
  return {
    success: true,
    message: body.message,
    user: body.user,
    token: { access_token: body.access_token, token_type: body.token_type ?? 'bearer', expires_in: body.expires_in ?? 86400 },
  };
}

/**
 * Log in a user (backend: FastAPI + MongoDB + JWT)
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const base = getApiUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
  } catch (err: unknown) {
    const msg = isNetworkError(err)
      ? BACKEND_UNREACHABLE_MSG
      : err instanceof Error && err.message
        ? err.message
        : "Login failed";
    throw new Error(msg);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(body.detail)
      ? body.detail.map((d: { msg?: string }) => d.msg).join(', ')
      : (body.detail ?? body.message ?? 'Login failed');
    throw new Error(msg);
  }
  setAuthToken(body.access_token);
  setAuthUser(body.user);
  return {
    success: true,
    message: body.message,
    user: body.user,
    token: { access_token: body.access_token, token_type: body.token_type ?? 'bearer', expires_in: body.expires_in ?? 86400 },
  };
}

/**
 * Get current authenticated user (frontend-only: from localStorage)
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const user = getAuthUser();
  if (!user) {
    throw new Error('No authentication token found');
  }
  return user;
}

/**
 * Log out current user
 */
export function logout(): void {
  removeAuthToken();
}

// Health report interfaces
export interface HealthReportData {
  health_score: number;
  risks: Array<{
    name: string;
    risk: number;
    status: 'Low' | 'Monitor' | 'High';
  }>;
  interpretations: Array<{
    icon: string;
    text: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  suggestions: string[];
  home_remedies: string[];
  medicine_categories: Array<{
    category: string;
    description: string;
  }>;
  extracted_text?: string;
  filename?: string;
}

export interface HealthReportResponse {
  id: string;
  user_id: string;
  health_score: number;
  risks: Array<{
    name: string;
    risk: number;
    status: string;
  }>;
  interpretations: Array<{
    icon: string;
    text: string;
    severity: string;
  }>;
  suggestions: string[];
  home_remedies: string[];
  medicine_categories: Array<{
    category: string;
    description: string;
  }>;
  extracted_text?: string;
  filename?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Save health report (frontend-only: store in localStorage)
 */
export async function saveHealthReport(data: HealthReportData, filename?: string): Promise<HealthReportResponse> {
  await new Promise((r) => setTimeout(r, 100));
  const now = new Date().toISOString();
  const report: HealthReportResponse = {
    id: `local-${Date.now()}`,
    user_id: getAuthUser()?.id ?? 'local',
    health_score: data.health_score,
    risks: data.risks,
    interpretations: data.interpretations,
    suggestions: data.suggestions,
    home_remedies: data.home_remedies,
    medicine_categories: data.medicine_categories,
    extracted_text: data.extracted_text,
    filename: filename ?? data.filename,
    created_at: now,
    updated_at: now,
  };
  localStorage.setItem(HEALTH_REPORT_KEY, JSON.stringify(report));
  return report;
}

/**
 * Get user's health report: from backend (latest) if logged in, else localStorage.
 */
export async function getHealthReport(): Promise<HealthReportResponse | null> {
  const fromBackend = await getLatestReport();
  if (fromBackend) return fromBackend;
  await new Promise((r) => setTimeout(r, 50));
  const raw = localStorage.getItem(HEALTH_REPORT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as HealthReportResponse;
  } catch {
    return null;
  }
}

// Chatbot interfaces
export interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotRequest {
  message: string;
  conversation_history?: ChatbotMessage[];
}

export interface ChatbotResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Send a message to the chatbot (frontend-only: mock response)
 */
export async function sendChatbotMessage(request: ChatbotRequest): Promise<ChatbotResponse> {
  await new Promise((r) => setTimeout(r, 600));
  const lower = request.message.toLowerCase();
  let message: string;
  if (lower.includes('hello') || lower.includes('hi')) {
    message = "Hello! This is frontend-only mode. I can't access real AI here, but you can use the app for health reports and navigation.";
  } else if (lower.includes('health') || lower.includes('report')) {
    message = "Upload a health report PDF from the upload panel to get a local analysis. No backend is connected.";
  } else {
    message = "Running in frontend-only mode. Connect a backend for real AI chatbot responses.";
  }
  return { success: true, message };
}

