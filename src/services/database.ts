import { getCurrentDatabaseProvider } from '../lib/database';

// Supabaseサービス
import { 
  mansionService as supabaseMansionService,
  roomService as supabaseRoomService,
  residentService as supabaseResidentService,
  contractorService as supabaseContractorService,
  repairService as supabaseRepairService
} from './supabaseDatabase';

// Neonサービス
import {
  neonMansionService,
  neonRoomService,
  neonResidentService,
  neonContractorService,
  neonRepairService
} from './neonDatabase';

// LibSQLサービス
import {
  libsqlMansionService,
  libsqlRoomService,
  libsqlResidentService,
  libsqlContractorService,
  libsqlRepairService
} from './libsqlDatabase';

// モックサービス
import {
  mockMansionService,
  mockRoomService,
  mockResidentService,
  mockContractorService,
  mockRepairService
} from './mockDatabase';

// データベースプロバイダーに応じたサービスを取得
const getServiceByProvider = () => {
  const provider = getCurrentDatabaseProvider();
  
  switch (provider) {
    case 'supabase':
      return {
        mansion: supabaseMansionService,
        room: supabaseRoomService,
        resident: supabaseResidentService,
        contractor: supabaseContractorService,
        repair: supabaseRepairService,
        contract: null, // TODO: Supabase contract service
        residentRequest: null, // TODO: Supabase resident request service
        notification: null, // TODO: Supabase notification service
        financial: null, // TODO: Supabase financial service
        payment: null, // TODO: Supabase payment service
        relation: null, // TODO: Supabase relation service
        dataIntegrity: null,
        dataReset: null
      };
    case 'neon':
      return {
        mansion: neonMansionService,
        room: neonRoomService,
        resident: neonResidentService,
        contractor: neonContractorService,
        repair: neonRepairService,
        contract: null, // TODO: Neon contract service
        residentRequest: null, // TODO: Neon resident request service
        notification: null, // TODO: Neon notification service
        financial: null, // TODO: Neon financial service
        payment: null, // TODO: Neon payment service
        relation: null, // TODO: Neon relation service
        dataIntegrity: null,
        dataReset: null
      };
    case 'libsql':
      return {
        mansion: libsqlMansionService,
        room: libsqlRoomService,
        resident: libsqlResidentService,
        contractor: libsqlContractorService,
        repair: libsqlRepairService,
        contract: null, // TODO: LibSQL contract service
        residentRequest: null, // TODO: LibSQL resident request service
        notification: null, // TODO: LibSQL notification service
        financial: null, // TODO: LibSQL financial service
        payment: null, // TODO: LibSQL payment service
        relation: null, // TODO: LibSQL relation service
        dataIntegrity: null,
        dataReset: null
      };
    case 'sqlite':
      return {
        mansion: libsqlMansionService, // SQLiteとLibSQLは同じインターフェース
        room: libsqlRoomService,
        resident: libsqlResidentService,
        contractor: libsqlContractorService,
        repair: libsqlRepairService,
        contract: null, // TODO: SQLite contract service
        residentRequest: null, // TODO: SQLite resident request service
        notification: null, // TODO: SQLite notification service
        financial: null, // TODO: SQLite financial service
        payment: null, // TODO: SQLite payment service
        relation: null, // TODO: SQLite relation service
        dataIntegrity: null,
        dataReset: null
      };
    case 'mock':
    default:
      const { 
        mockContractService, 
        mockResidentRequestService, 
        mockNotificationService, 
        mockFinancialService, 
        mockPaymentService,
        mockRelationService,
        mockDataIntegrityService,
        mockDataResetService
      } = require('./mockDatabase');
      
      return {
        mansion: mockMansionService,
        room: mockRoomService,
        resident: mockResidentService,
        contractor: mockContractorService,
        repair: mockRepairService,
        contract: mockContractService,
        residentRequest: mockResidentRequestService,
        notification: mockNotificationService,
        financial: mockFinancialService,
        payment: mockPaymentService,
        relation: mockRelationService,
        dataIntegrity: mockDataIntegrityService,
        dataReset: mockDataResetService
      };
  }
};

// 統一されたサービスインターフェース
export const mansionService = {
  async getAll() {
    const service = getServiceByProvider();
    return await service.mansion.getAll();
  },
  async create(mansion: any) {
    const service = getServiceByProvider();
    return await service.mansion.create(mansion);
  },
  async update(id: string, mansion: any) {
    const service = getServiceByProvider();
    return await service.mansion.update(id, mansion);
  },
  async delete(id: string) {
    const service = getServiceByProvider();
    return await service.mansion.delete(id);
  }
};

export const roomService = {
  async getByMansionId(mansionId: string) {
    const service = getServiceByProvider();
    return await service.room.getByMansionId(mansionId);
  },
  async create(room: any) {
    const service = getServiceByProvider();
    return await service.room.create(room);
  },
  async update(id: string, room: any) {
    const service = getServiceByProvider();
    return await service.room.update(id, room);
  },
  async delete(id: string) {
    const service = getServiceByProvider();
    return await service.room.delete(id);
  }
};

export const residentService = {
  async getAll(includeDeleted = false) {
    const service = getServiceByProvider();
    return await service.resident.getAll(includeDeleted);
  },
  async create(resident: any) {
    const service = getServiceByProvider();
    return await service.resident.create(resident);
  },
  async update(id: string, resident: any) {
    const service = getServiceByProvider();
    return await service.resident.update(id, resident);
  },
  async delete(id: string) {
    const service = getServiceByProvider();
    return await service.resident.delete(id);
  }
};

export const contractorService = {
  async getAll(includeDeleted = false) {
    const service = getServiceByProvider();
    return await service.contractor.getAll(includeDeleted);
  },
  async create(contractor: any) {
    const service = getServiceByProvider();
    return await service.contractor.create(contractor);
  },
  async update(id: string, contractor: any) {
    const service = getServiceByProvider();
    return await service.contractor.update(id, contractor);
  },
  async delete(id: string) {
    const service = getServiceByProvider();
    return await service.contractor.delete(id);
  }
};

export const repairService = {
  async getAll(includeDeleted = false) {
    const service = getServiceByProvider();
    return await service.repair.getAll(includeDeleted);
  },
  async create(repair: any) {
    const service = getServiceByProvider();
    return await service.repair.create(repair);
  },
  async update(id: string, repair: any) {
    const service = getServiceByProvider();
    return await service.repair.update(id, repair);
  },
  async delete(id: string) {
    const service = getServiceByProvider();
    return await service.repair.delete(id);
  }
};

// レガシーサポート（既存のコードとの互換性）
export const contractService = {
  async getAll() { return []; },
  async create() { return {}; },
  async update() { return { success: true }; },
  async delete() { return; }
};

export const contractStepService = {
  async getByContractId() { return []; },
  async create() { return {}; },
  async update() { return { success: true }; },
  async delete() { return; }
};

export const residentRequestService = {
  async getAll() { return []; },
  async create() { return {}; },
  async update() { return { success: true }; }
};

export const notificationService = {
  async getByUserId() { return []; },
  async markAsRead() { return; }
};

export const financialService = {
  async getAll() { return []; },
  async create() { return {}; },
  async update() { return { success: true }; }
};

export const paymentService = {
  async getAll() { return []; },
  async create() { return {}; },
  async update() { return { success: true }; }
};

export const relationService = {
  async getAll() {
    const service = getServiceByProvider();
    return await service.relation?.getAll() || [];
  },
  async create(relation: any) {
    const service = getServiceByProvider();
    return await service.relation?.create(relation) || {};
  },
  async update(id: string, relation: any) {
    const service = getServiceByProvider();
    return await service.relation?.update(id, relation) || { success: true };
  },
  async delete(id: string) {
    const service = getServiceByProvider();
    return await service.relation?.delete(id);
  },
  async getDashboardStats() {
    const service = getServiceByProvider();
    return await service.relation?.getDashboardStats() || {
      totalProperties: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      totalResidents: 0,
      activeContracts: 0,
      pendingRepairs: 0,
      urgentRepairs: 0,
      unreadRequests: 0,
      totalMonthlyRevenue: 0,
      averageOccupancy: 0,
      completedRepairs: 0,
      inProgressRepairs: 0,
      recentRepairs: [],
      expiringContracts: 0,
      monthlyRevenue: 0,
      occupancyRate: 0
    };
  }
};