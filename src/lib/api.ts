/**
 * Frontend-only API: no backend. Auth, health report, and chatbot use local/mock data.
 */

// Token / user storage (localStorage only)
const HEALTH_REPORT_KEY = 'health_report';

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

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

// Default values for recommendations
const defaultHomeRemedies = [
  'Warm water with lemon in the morning',
  'Balanced diet with leafy greens',
  'Adequate sleep (7-8 hours)',
  'Stress management through meditation',
];

const defaultMedicineCategories = [
  { category: 'Antipyretic medicines', description: 'Commonly used for fever or pain management' },
  { category: 'Antacid medicines', description: 'Commonly used for digestive health' },
  { category: 'Antihistamine medicines', description: 'Commonly used for allergy management' },
];

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
 * Analyze PDF and return health insights
 */
export async function analyzeHealthReport(file: File): Promise<HealthAnalysis> {
  // Step 1: Upload and extract PDF
  const uploadResult = await uploadPDF(file);
  
  // Step 2: Generate embeddings
  const embeddingResult = await generateEmbeddings(uploadResult.extracted_text);
  
  // Step 3: Search knowledge base for similar conditions (use brain_cardio collection)
  const searchResult = await searchKnowledgeBase(uploadResult.extracted_text, 5, 'brain_cardio');
  
  // Step 4: Analyze and return health insights
  const analysis = analyzeExtractedData(uploadResult, searchResult);
  
  // Step 5: Save to database
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
    // Don't throw - analysis is still valid even if save fails
  }
  
  return analysis;
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
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
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
 * Sign up a new user (frontend-only: store in localStorage, no backend)
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 300));
  const user: UserResponse = {
    id: `local-${Date.now()}`,
    email: data.email,
    full_name: data.full_name,
    phone: data.phone,
    created_at: new Date().toISOString(),
    is_active: true,
  };
  const token = `local_token_${Date.now()}`;
  setAuthToken(token);
  setAuthUser(user);
  return {
    success: true,
    message: 'Account created',
    user,
    token: { access_token: token, token_type: 'bearer', expires_in: 86400 },
  };
}

/**
 * Log in a user (frontend-only: any email/password, store in localStorage)
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 300));
  const user: UserResponse = {
    id: `local-${Date.now()}`,
    email: data.email,
    full_name: data.email.split('@')[0],
    created_at: new Date().toISOString(),
    is_active: true,
  };
  const token = `local_token_${Date.now()}`;
  setAuthToken(token);
  setAuthUser(user);
  return {
    success: true,
    message: 'Welcome back',
    user,
    token: { access_token: token, token_type: 'bearer', expires_in: 86400 },
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
 * Get user's health report (frontend-only: from localStorage)
 */
export async function getHealthReport(): Promise<HealthReportResponse | null> {
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

