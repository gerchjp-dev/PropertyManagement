export interface Mansion {
  id: string;
  name: string;
  address: string;
  purchaseDate: string;
  photoPaths: string[];
  deedPdfPath?: string;
  totalRooms: number;
  occupancyRate: number;
}

export interface Room {
  id: string;
  mansionId: string;
  roomNumber: string;
  layout: string;
  size: number;
  floor: number;
  photoPaths: string[];
  conditionNotes: string;
  isOccupied: boolean;
  monthlyRent: number;
  maintenanceFee: number;
  parkingFee?: number;
  isDeleted?: boolean; // 論理削除フラグ
  deletedDate?: string; // 削除日
  residentHistory?: string[]; // 住民履歴（住民IDの配列）
}

export interface Resident {
  id: string;
  roomId: string;
  name: string;
  phone: string;
  email: string;
  moveInDate: string;
  emergencyContact: string;
  userId?: string;
  password?: string;
  isActive: boolean;
}

export interface Contract {
  id: string;
  residentId: string;
  startDate: string;
  endDate: string;
  rent: number;
  maintenanceFee: number;
  deposit: number;
  keyMoney: number;
  guarantor: string;
  contractPdfPath?: string;
  status: 'active' | 'expired' | 'pending' | 'renewal-due';
  renewalDate?: string;
  renewalFee?: number;
  contractSteps: ContractStep[];
  notes?: string;
  applicationDate?: string; // 申込日
  approvalDate?: string; // 承認日
  signingDate?: string; // 契約締結日
  moveInDate?: string; // 入居日
  keyHandoverDate?: string; // 鍵渡し日
}

export interface ContractStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'application' | 'screening' | 'approval' | 'contract' | 'payment' | 'move-in' | 'other';
  startDate?: string;
  completionDate?: string;
  dueDate?: string;
  documentPaths: string[];
  notes?: string;
  assignedTo?: string; // 担当者
  reportedBy?: string; // 報告者
  reportedDate?: string; // 報告日
  isRequired: boolean; // 必須ステップかどうか
}

export interface RepairRecord {
  id: string;
  roomId?: string; // 部屋個別修繕の場合のみ
  mansionId: string; // 必須：どの物件の修繕か
  scope: 'room' | 'building'; // 修繕範囲
  description: string;
  requestDate: string; // 依頼日
  startDate?: string; // 開始日
  completionDate?: string; // 完了日
  cost: number;
  estimatedCost?: number; // 見積金額
  contractor: string;
  contractorId?: string;
  photoPaths: string[];
  reportPdfPath?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'plumbing' | 'electrical' | 'interior' | 'exterior' | 'equipment' | 'other';
  progressSteps: RepairProgressStep[];
  notes?: string;
}

export interface RepairProgressStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  startDate?: string;
  completionDate?: string;
  photoPaths: string[];
  notes?: string;
  reportedBy?: string; // 報告者
  reportedDate?: string; // 報告日
}

export interface ResidentRequest {
  id: string;
  residentId: string;
  roomId: string;
  type: 'repair' | 'complaint' | 'suggestion' | 'inquiry';
  title: string;
  description: string;
  photoPaths: string[];
  status: 'submitted' | 'reviewing' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedDate: string;
  responseDate?: string;
  response?: string;
  assignedTo?: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  roomId?: string;
  residentId?: string;
  invoicePdfPath?: string;
  receiptPdfPath?: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
}

export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  occupancyRate: number;
  incomeBreakdown: {
    rent: number;
    maintenanceFee: number;
    deposit: number;
    keyMoney: number;
    parking: number;
    other: number;
  };
  expenseBreakdown: {
    management: number;
    maintenance: number;
    utilities: number;
    repairs: number;
    insurance: number;
    taxes: number;
    other: number;
  };
  reportPdfPath?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'resident';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'contract-renewal' | 'payment-overdue' | 'repair-request' | 'maintenance-scheduled' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdDate: string;
  actionUrl?: string;
}

export interface Contractor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  isActive: boolean;
  lastWorkDate?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  payeeName: string;
  amount: number;
  description: string;
  paymentDate: string;
  dueDate?: string;
  category: 'contractor' | 'utility' | 'maintenance' | 'insurance' | 'tax' | 'other';
  paymentMethod: 'bank_transfer' | 'credit_card' | 'cash' | 'check';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  bankAccount?: {
    bankName: string;
    branchName: string;
    accountType: 'checking' | 'savings';
    accountNumber: string;
    accountName: string;
  };
  invoiceNumber?: string;
  receiptPath?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  url: string;
  size: number;
  uploadDate: string;
}

export type ViewMode = 'dashboard' | 'mansions' | 'rooms' | 'residents' | 'contracts' | 'repairs' | 'financial' | 'reports' | 'resident-requests' | 'notifications' | 'user-management' | 'contractors' | 'payments';

export interface MansionExpense {
  id: string;
  mansionId: string;
  mansionName: string;
  year: number;
  month: number;
  expenses: {
    management: number;
    utilities: number;
    maintenance: number;
    repairs: number;
    insurance: number;
    cleaning: number;
    security: number;
    other: number;
  };
  totalExpense: number;
  uploadedFiles: {
    name: string;
    type: string;
    uploadDate: string;
  }[];
}

export type UserRole = 'admin' | 'manager' | 'resident';

export type DatabaseProvider = 'supabase' | 'neon' | 'libsql' | 'sqlite' | 'mock';
export interface DatabaseConfig {
  provider: DatabaseProvider;
  supabase?: {
    url: string;
    anonKey: string;
  };
  neon?: {
    connectionString: string;
  };
  libsql?: {
    url: string;
    authToken?: string;
  };
  sqlite?: {
    filename: string;
  };
}