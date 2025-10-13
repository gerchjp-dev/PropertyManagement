import { mockMansions, mockRooms, mockResidents, mockContractors, mockRepairRecords, mockContracts, mockResidentRequests, mockFinancialRecords, mockPaymentRecords, mockNotifications } from '../data/mockData';
import type { Mansion, Room, Resident, Contractor, RepairRecord, Contract, ResidentRequest, FinancialRecord, PaymentRecord, Notification } from '../types';

// モックデータベースサービス（メモリ内データ操作）
let mockMansionData = [...mockMansions];
let mockRoomData = [...mockRooms];
let mockResidentData = [...mockResidents];
let mockContractorData = [...mockContractors];
let mockRepairData = [...mockRepairRecords];
let mockContractData = [...mockContracts];
let mockRequestData = [...mockResidentRequests];
let mockFinancialData = [...mockFinancialRecords];
let mockPaymentData = [...mockPaymentRecords];
let mockNotificationData = [...mockNotifications];

// ユーティリティ関数
const generateId = (prefix: string = 'id') => {
  // Generate a valid UUID v4 format
  const chars = '0123456789abcdef';
  let uuid = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    if (i === 12) {
      uuid += '4'; // Version 4
    } else if (i === 16) {
      uuid += chars[(Math.random() * 4 | 0) + 8]; // Variant bits
    } else {
      uuid += chars[Math.random() * 16 | 0];
    }
  }
  return uuid;
};

const updateTimestamp = (item: any) => {
  return {
    ...item,
    updatedAt: new Date().toISOString()
  };
};

// 物件管理（モック）
export const mockMansionService = {
  async getAll(): Promise<Mansion[]> {
    return Promise.resolve([...mockMansionData]);
  },

  async getById(id: string): Promise<Mansion | null> {
    const mansion = mockMansionData.find(m => m.id === id);
    return Promise.resolve(mansion || null);
  },

  async create(mansion: Omit<Mansion, 'id'>): Promise<Mansion> {
    const newMansion: Mansion = {
      id: generateId('mansion'),
      ...mansion
    };
    mockMansionData.push(newMansion);
    
    // 入居率を再計算
    await this.updateOccupancyRate(newMansion.id);
    
    return Promise.resolve(newMansion);
  },

  async update(id: string, mansion: Partial<Mansion>): Promise<{ success: boolean }> {
    const index = mockMansionData.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMansionData[index] = updateTimestamp({ ...mockMansionData[index], ...mansion });
      
      // 入居率を再計算
      await this.updateOccupancyRate(id);
      
      return Promise.resolve({ success: true });
    }
    throw new Error('Mansion not found');
  },

  async delete(id: string): Promise<void> {
    // 関連データの確認
    const relatedRooms = mockRoomData.filter(r => r.mansionId === id);
    const relatedRepairs = mockRepairData.filter(r => r.mansionId === id);
    
    if (relatedRooms.length > 0 || relatedRepairs.length > 0) {
      throw new Error('この物件には関連する部屋または修繕記録があるため削除できません');
    }
    
    mockMansionData = mockMansionData.filter(m => m.id !== id);
    return Promise.resolve();
  },

  async updateOccupancyRate(mansionId: string): Promise<void> {
    const mansion = mockMansionData.find(m => m.id === mansionId);
    if (!mansion) return;
    
    const rooms = mockRoomData.filter(r => r.mansionId === mansionId);
    const occupiedRooms = rooms.filter(r => r.isOccupied);
    
    const occupancyRate = rooms.length > 0 ? (occupiedRooms.length / rooms.length) * 100 : 0;
    
    const index = mockMansionData.findIndex(m => m.id === mansionId);
    if (index !== -1) {
      mockMansionData[index] = updateTimestamp({
        ...mockMansionData[index],
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        totalRooms: rooms.length
      });
    }
  }
};

// 部屋管理（モック）
export const mockRoomService = {
  async getAll(): Promise<Room[]> {
    return Promise.resolve([...mockRoomData]);
  },

  async getByMansionId(mansionId: string): Promise<Room[]> {
    const rooms = mockRoomData.filter(r => r.mansionId === mansionId);
    return Promise.resolve([...rooms]);
  },

  async getById(id: string): Promise<Room | null> {
    const room = mockRoomData.find(r => r.id === id);
    return Promise.resolve(room || null);
  },

  async create(room: Omit<Room, 'id'>): Promise<Room> {
    // 同じ物件内で部屋番号の重複チェック
    const existingRoom = mockRoomData.find(r => 
      r.mansionId === room.mansionId && r.roomNumber === room.roomNumber
    );
    if (existingRoom) {
      throw new Error('同じ物件内に同じ部屋番号が既に存在します');
    }

    const newRoom: Room = {
      id: generateId('room'),
      ...room
    };
    mockRoomData.push(newRoom);
    
    // 物件の入居率を更新
    await mockMansionService.updateOccupancyRate(room.mansionId);
    
    return Promise.resolve(newRoom);
  },

  async update(id: string, room: Partial<Room>): Promise<{ success: boolean }> {
    const index = mockRoomData.findIndex(r => r.id === id);
    if (index !== -1) {
      const oldRoom = mockRoomData[index];
      mockRoomData[index] = updateTimestamp({ ...oldRoom, ...room });
      
      // 入居状況が変更された場合、物件の入居率を更新
      if (room.isOccupied !== undefined || room.mansionId !== undefined) {
        await mockMansionService.updateOccupancyRate(mockRoomData[index].mansionId);
        if (oldRoom.mansionId !== mockRoomData[index].mansionId) {
          await mockMansionService.updateOccupancyRate(oldRoom.mansionId);
        }
      }
      
      return Promise.resolve({ success: true });
    }
    throw new Error('Room not found');
  },

  async delete(id: string): Promise<void> {
    const room = mockRoomData.find(r => r.id === id);
    if (!room) throw new Error('Room not found');
    
    // 関連データの確認
    const relatedResidents = mockResidentData.filter(r => r.roomId === id);
    const relatedRepairs = mockRepairData.filter(r => r.roomId === id);
    
    if (relatedResidents.length > 0) {
      throw new Error('この部屋には住民が登録されているため削除できません');
    }
    
    // 修繕記録の部屋IDをnullに設定
    mockRepairData = mockRepairData.map(repair => 
      repair.roomId === id ? { ...repair, roomId: undefined } : repair
    );
    
    mockRoomData = mockRoomData.filter(r => r.id !== id);
    
    // 物件の入居率を更新
    await mockMansionService.updateOccupancyRate(room.mansionId);
    
    return Promise.resolve();
  }
};

// 住民管理（モック）
export const mockResidentService = {
  async getAll(includeDeleted = false): Promise<Resident[]> {
    return Promise.resolve([...mockResidentData]);
  },

  async getById(id: string): Promise<Resident | null> {
    const resident = mockResidentData.find(r => r.id === id);
    return Promise.resolve(resident || null);
  },

  async getByRoomId(roomId: string): Promise<Resident[]> {
    const residents = mockResidentData.filter(r => r.roomId === roomId);
    return Promise.resolve([...residents]);
  },

  async create(resident: Omit<Resident, 'id'>): Promise<Resident> {
    // ユーザーIDの重複チェック
    if (resident.userId) {
      const existingResident = mockResidentData.find(r => r.userId === resident.userId);
      if (existingResident) {
        throw new Error('このユーザーIDは既に使用されています');
      }
    }

    const newResident: Resident = {
      id: generateId('resident'),
      ...resident
    };
    mockResidentData.push(newResident);
    
    // 部屋の入居状況を更新
    if (resident.roomId) {
      await mockRoomService.update(resident.roomId, { isOccupied: true });
    }
    
    return Promise.resolve(newResident);
  },

  async update(id: string, resident: Partial<Resident>): Promise<{ success: boolean }> {
    const index = mockResidentData.findIndex(r => r.id === id);
    if (index !== -1) {
      const oldResident = mockResidentData[index];
      mockResidentData[index] = updateTimestamp({ ...oldResident, ...resident });
      
      // 部屋が変更された場合、入居状況を更新
      if (resident.roomId !== undefined && resident.roomId !== oldResident.roomId) {
        // 古い部屋を空室に
        if (oldResident.roomId) {
          const otherResidentsInOldRoom = mockResidentData.filter(r => 
            r.roomId === oldResident.roomId && r.id !== id
          );
          if (otherResidentsInOldRoom.length === 0) {
            await mockRoomService.update(oldResident.roomId, { isOccupied: false });
          }
        }
        
        // 新しい部屋を入居中に
        if (resident.roomId) {
          await mockRoomService.update(resident.roomId, { isOccupied: true });
        }
      }
      
      return Promise.resolve({ success: true });
    }
    throw new Error('Resident not found');
  },

  async delete(id: string): Promise<void> {
    const resident = mockResidentData.find(r => r.id === id);
    if (!resident) throw new Error('Resident not found');
    
    // 関連データの処理
    const relatedContracts = mockContractData.filter(c => c.residentId === id);
    const relatedRequests = mockRequestData.filter(r => r.residentId === id);
    
    if (relatedContracts.length > 0) {
      throw new Error('この住民には有効な契約があるため削除できません');
    }
    
    // 住民要望の住民IDをnullに設定（履歴として残す）
    mockRequestData = mockRequestData.map(request => 
      request.residentId === id ? { ...request, residentId: 'deleted_resident' } : request
    );
    
    // 部屋の入居状況を更新
    if (resident.roomId) {
      const otherResidentsInRoom = mockResidentData.filter(r => 
        r.roomId === resident.roomId && r.id !== id
      );
      if (otherResidentsInRoom.length === 0) {
        await mockRoomService.update(resident.roomId, { isOccupied: false });
      }
    }
    
    mockResidentData = mockResidentData.filter(r => r.id !== id);
    return Promise.resolve();
  }
};

// 業者管理（モック）
export const mockContractorService = {
  async getAll(includeDeleted = false): Promise<Contractor[]> {
    return Promise.resolve([...mockContractorData]);
  },

  async getById(id: string): Promise<Contractor | null> {
    const contractor = mockContractorData.find(c => c.id === id);
    return Promise.resolve(contractor || null);
  },

  async getBySpecialty(specialty: string): Promise<Contractor[]> {
    const contractors = mockContractorData.filter(c => 
      c.specialties.includes(specialty) && c.isActive
    );
    return Promise.resolve([...contractors]);
  },

  async create(contractor: Omit<Contractor, 'id'>): Promise<Contractor> {
    const newContractor: Contractor = {
      id: generateId('contractor'),
      ...contractor
    };
    mockContractorData.push(newContractor);
    return Promise.resolve(newContractor);
  },

  async update(id: string, contractor: Partial<Contractor>): Promise<{ success: boolean }> {
    const index = mockContractorData.findIndex(c => c.id === id);
    if (index !== -1) {
      mockContractorData[index] = updateTimestamp({ ...mockContractorData[index], ...contractor });
      
      // 業者名が変更された場合、関連する修繕記録も更新
      if (contractor.name) {
        mockRepairData = mockRepairData.map(repair => 
          repair.contractorId === id ? { ...repair, contractor: contractor.name } : repair
        );
      }
      
      return Promise.resolve({ success: true });
    }
    throw new Error('Contractor not found');
  },

  async delete(id: string): Promise<void> {
    const contractor = mockContractorData.find(c => c.id === id);
    if (!contractor) throw new Error('Contractor not found');
    
    // 関連する修繕記録の確認
    const relatedRepairs = mockRepairData.filter(r => r.contractorId === id);
    
    if (relatedRepairs.length > 0) {
      throw new Error('この業者には関連する修繕記録があるため削除できません');
    }
    
    mockContractorData = mockContractorData.filter(c => c.id !== id);
    return Promise.resolve();
  }
};

// 修繕管理（モック）
export const mockRepairService = {
  async getAll(includeDeleted = false): Promise<RepairRecord[]> {
    return Promise.resolve([...mockRepairData]);
  },

  async getById(id: string): Promise<RepairRecord | null> {
    const repair = mockRepairData.find(r => r.id === id);
    return Promise.resolve(repair || null);
  },

  async getByMansionId(mansionId: string): Promise<RepairRecord[]> {
    const repairs = mockRepairData.filter(r => r.mansionId === mansionId);
    return Promise.resolve([...repairs]);
  },

  async getByRoomId(roomId: string): Promise<RepairRecord[]> {
    const repairs = mockRepairData.filter(r => r.roomId === roomId);
    return Promise.resolve([...repairs]);
  },

  async create(repair: Omit<RepairRecord, 'id' | 'progressSteps'>): Promise<RepairRecord> {
    const newRepair: RepairRecord = {
      id: generateId('repair'),
      ...repair,
      progressSteps: []
    };
    mockRepairData.push(newRepair);
    
    // 業者の最終作業日を更新
    if (repair.contractorId) {
      await mockContractorService.update(repair.contractorId, {
        lastWorkDate: repair.requestDate
      });
    }
    
    return Promise.resolve(newRepair);
  },

  async update(id: string, repair: Partial<RepairRecord>): Promise<{ success: boolean }> {
    const index = mockRepairData.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRepairData[index] = updateTimestamp({ ...mockRepairData[index], ...repair });
      
      // 業者が変更された場合、最終作業日を更新
      if (repair.contractorId) {
        await mockContractorService.update(repair.contractorId, {
          lastWorkDate: repair.requestDate || mockRepairData[index].requestDate
        });
      }
      
      return Promise.resolve({ success: true });
    }
    throw new Error('Repair record not found');
  },

  async delete(id: string): Promise<void> {
    mockRepairData = mockRepairData.filter(r => r.id !== id);
    return Promise.resolve();
  }
};

// 契約管理（モック）
export const mockContractService = {
  async getAll(): Promise<Contract[]> {
    return Promise.resolve([...mockContractData]);
  },

  async getById(id: string): Promise<Contract | null> {
    const contract = mockContractData.find(c => c.id === id);
    return Promise.resolve(contract || null);
  },

  async getByResidentId(residentId: string): Promise<Contract[]> {
    const contracts = mockContractData.filter(c => c.residentId === residentId);
    return Promise.resolve([...contracts]);
  },

  async create(contract: Omit<Contract, 'id'>): Promise<Contract> {
    const newContract: Contract = {
      id: generateId('contract'),
      ...contract
    };
    mockContractData.push(newContract);
    return Promise.resolve(newContract);
  },

  async update(id: string, contract: Partial<Contract>): Promise<{ success: boolean }> {
    const index = mockContractData.findIndex(c => c.id === id);
    if (index !== -1) {
      mockContractData[index] = updateTimestamp({ ...mockContractData[index], ...contract });
      return Promise.resolve({ success: true });
    }
    throw new Error('Contract not found');
  },

  async delete(id: string): Promise<void> {
    const contract = mockContractData.find(c => c.id === id);
    if (!contract) throw new Error('Contract not found');
    
    // 関連する住民の契約状況を更新
    const resident = mockResidentData.find(r => r.id === contract.residentId);
    if (resident && resident.roomId) {
      await mockRoomService.update(resident.roomId, { isOccupied: false });
    }
    
    mockContractData = mockContractData.filter(c => c.id !== id);
    return Promise.resolve();
  }
};

// 住民要望管理（モック）
export const mockResidentRequestService = {
  async getAll(): Promise<ResidentRequest[]> {
    return Promise.resolve([...mockRequestData]);
  },

  async getById(id: string): Promise<ResidentRequest | null> {
    const request = mockRequestData.find(r => r.id === id);
    return Promise.resolve(request || null);
  },

  async getByResidentId(residentId: string): Promise<ResidentRequest[]> {
    const requests = mockRequestData.filter(r => r.residentId === residentId);
    return Promise.resolve([...requests]);
  },

  async create(request: Omit<ResidentRequest, 'id'>): Promise<ResidentRequest> {
    const newRequest: ResidentRequest = {
      id: generateId('request'),
      ...request
    };
    mockRequestData.push(newRequest);
    
    // 通知を作成
    const notification: Notification = {
      id: generateId('notification'),
      userId: 'admin',
      type: 'repair-request',
      title: '新しい住民要望',
      message: `${request.title}の要望が提出されました`,
      isRead: false,
      createdDate: new Date().toISOString()
    };
    mockNotificationData.push(notification);
    
    return Promise.resolve(newRequest);
  },

  async update(id: string, request: Partial<ResidentRequest>): Promise<{ success: boolean }> {
    const index = mockRequestData.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRequestData[index] = updateTimestamp({ ...mockRequestData[index], ...request });
      return Promise.resolve({ success: true });
    }
    throw new Error('Resident request not found');
  },

  async delete(id: string): Promise<void> {
    mockRequestData = mockRequestData.filter(r => r.id !== id);
    return Promise.resolve();
  }
};

// 財務記録管理（モック）
export const mockFinancialService = {
  async getAll(): Promise<FinancialRecord[]> {
    return Promise.resolve([...mockFinancialData]);
  },

  async getById(id: string): Promise<FinancialRecord | null> {
    const record = mockFinancialData.find(r => r.id === id);
    return Promise.resolve(record || null);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<FinancialRecord[]> {
    const records = mockFinancialData.filter(r => 
      r.date >= startDate && r.date <= endDate
    );
    return Promise.resolve([...records]);
  },

  async getByType(type: 'income' | 'expense'): Promise<FinancialRecord[]> {
    const records = mockFinancialData.filter(r => r.type === type);
    return Promise.resolve([...records]);
  },

  async create(record: Omit<FinancialRecord, 'id'>): Promise<FinancialRecord> {
    const newRecord: FinancialRecord = {
      id: generateId('financial'),
      ...record
    };
    mockFinancialData.push(newRecord);
    return Promise.resolve(newRecord);
  },

  async update(id: string, record: Partial<FinancialRecord>): Promise<{ success: boolean }> {
    const index = mockFinancialData.findIndex(r => r.id === id);
    if (index !== -1) {
      mockFinancialData[index] = updateTimestamp({ ...mockFinancialData[index], ...record });
      return Promise.resolve({ success: true });
    }
    throw new Error('Financial record not found');
  },

  async delete(id: string): Promise<void> {
    mockFinancialData = mockFinancialData.filter(r => r.id !== id);
    return Promise.resolve();
  }
};

// 支払い記録管理（モック）
export const mockPaymentService = {
  async getAll(): Promise<PaymentRecord[]> {
    return Promise.resolve([...mockPaymentData]);
  },

  async getById(id: string): Promise<PaymentRecord | null> {
    const payment = mockPaymentData.find(p => p.id === id);
    return Promise.resolve(payment || null);
  },

  async getByStatus(status: 'pending' | 'completed' | 'failed' | 'cancelled'): Promise<PaymentRecord[]> {
    const payments = mockPaymentData.filter(p => p.status === status);
    return Promise.resolve([...payments]);
  },

  async create(payment: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> {
    const newPayment: PaymentRecord = {
      id: generateId('payment'),
      ...payment
    };
    mockPaymentData.push(newPayment);
    return Promise.resolve(newPayment);
  },

  async update(id: string, payment: Partial<PaymentRecord>): Promise<{ success: boolean }> {
    const index = mockPaymentData.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPaymentData[index] = updateTimestamp({ ...mockPaymentData[index], ...payment });
      return Promise.resolve({ success: true });
    }
    throw new Error('Payment record not found');
  },

  async delete(id: string): Promise<void> {
    mockPaymentData = mockPaymentData.filter(p => p.id !== id);
    return Promise.resolve();
  }
};

// 通知管理（モック）
export const mockNotificationService = {
  async getByUserId(userId: string): Promise<Notification[]> {
    const notifications = mockNotificationData.filter(n => n.userId === userId);
    return Promise.resolve([...notifications]);
  },

  async markAsRead(id: string): Promise<void> {
    const index = mockNotificationData.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotificationData[index] = { ...mockNotificationData[index], isRead: true };
    }
    return Promise.resolve();
  },

  async markAllAsRead(userId: string): Promise<void> {
    mockNotificationData = mockNotificationData.map(n => 
      n.userId === userId ? { ...n, isRead: true } : n
    );
    return Promise.resolve();
  },

  async create(notification: Omit<Notification, 'id'>): Promise<Notification> {
    const newNotification: Notification = {
      id: generateId('notification'),
      ...notification
    };
    mockNotificationData.push(newNotification);
    return Promise.resolve(newNotification);
  },

  async delete(id: string): Promise<void> {
    mockNotificationData = mockNotificationData.filter(n => n.id !== id);
    return Promise.resolve();
  }
};

// 関連データ取得ヘルパー関数
export const mockRelationService = {
  // 物件の詳細情報（部屋、住民、修繕記録を含む）
  async getMansionDetails(mansionId: string) {
    const mansion = await mockMansionService.getById(mansionId);
    if (!mansion) throw new Error('Mansion not found');
    
    const rooms = await mockRoomService.getByMansionId(mansionId);
    const repairs = await mockRepairService.getByMansionId(mansionId);
    
    const residents = [];
    for (const room of rooms) {
      const roomResidents = await mockResidentService.getByRoomId(room.id);
      residents.push(...roomResidents);
    }
    
    return {
      mansion,
      rooms,
      residents,
      repairs,
      totalRooms: rooms.length,
      occupiedRooms: rooms.filter(r => r.isOccupied).length,
      totalResidents: residents.length
    };
  },

  // 住民の詳細情報（部屋、契約、要望を含む）
  async getResidentDetails(residentId: string) {
    const resident = await mockResidentService.getById(residentId);
    if (!resident) throw new Error('Resident not found');
    
    const room = resident.roomId ? await mockRoomService.getById(resident.roomId) : null;
    const mansion = room ? await mockMansionService.getById(room.mansionId) : null;
    const contracts = await mockContractService.getByResidentId(residentId);
    const requests = await mockResidentRequestService.getByResidentId(residentId);
    
    return {
      resident,
      room,
      mansion,
      contracts,
      requests,
      activeContract: contracts.find(c => c.status === 'active')
    };
  },

  // 部屋の詳細情報（住民、修繕記録を含む）
  async getRoomDetails(roomId: string) {
    const room = await mockRoomService.getById(roomId);
    if (!room) throw new Error('Room not found');
    
    const mansion = await mockMansionService.getById(room.mansionId);
    const residents = await mockResidentService.getByRoomId(roomId);
    const repairs = await mockRepairService.getByRoomId(roomId);
    
    return {
      room,
      mansion,
      residents,
      repairs,
      currentResident: residents.find(r => r.isActive),
      repairHistory: repairs.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    };
  },

  // 業者の作業履歴
  async getContractorWorkHistory(contractorId: string) {
    const contractor = await mockContractorService.getById(contractorId);
    if (!contractor) throw new Error('Contractor not found');
    
    const repairs = mockRepairData.filter(r => r.contractorId === contractorId);
    const payments = mockPaymentData.filter(p => 
      p.category === 'contractor' && p.payeeName === contractor.name
    );
    
    return {
      contractor,
      repairs: repairs.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()),
      payments: payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
      totalEarnings: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      averageRating: contractor.rating
    };
  },

  // ダッシュボード統計データ
  async getDashboardStats() {
    const mansions = await mockMansionService.getAll();
    const rooms = await mockRoomService.getAll();
    const residents = await mockResidentService.getAll();
    const contracts = await mockContractService.getAll();
    const repairs = await mockRepairService.getAll();
    const requests = await mockResidentRequestService.getAll();
    
    const occupiedRooms = rooms.filter(r => r.isOccupied);
    const activeContracts = contracts.filter(c => c.status === 'active');
    const pendingRepairs = repairs.filter(r => r.status === 'pending');
    const urgentRepairs = repairs.filter(r => r.priority === 'urgent');
    const unreadRequests = requests.filter(r => r.status === 'submitted');
    
    const totalMonthlyRevenue = occupiedRooms.reduce((sum, room) => sum + room.monthlyRent, 0);
    const averageOccupancy = mansions.length > 0 
      ? mansions.reduce((sum, mansion) => sum + mansion.occupancyRate, 0) / mansions.length 
      : 0;
    
    return {
      totalProperties: mansions.length,
      totalRooms: rooms.length,
      occupiedRooms: occupiedRooms.length,
      totalResidents: residents.length,
      activeContracts: activeContracts.length,
      pendingRepairs: pendingRepairs.length,
      urgentRepairs: urgentRepairs.length,
      unreadRequests: unreadRequests.length,
      totalMonthlyRevenue,
      averageOccupancy: Math.round(averageOccupancy * 10) / 10
    };
  }
};

// データ整合性チェック関数
export const mockDataIntegrityService = {
  async checkDataIntegrity() {
    const issues = [];
    
    // 孤立した部屋（存在しない物件を参照）
    for (const room of mockRoomData) {
      const mansion = await mockMansionService.getById(room.mansionId);
      if (!mansion) {
        issues.push(`部屋 ${room.roomNumber} が存在しない物件を参照しています`);
      }
    }
    
    // 孤立した住民（存在しない部屋を参照）
    for (const resident of mockResidentData) {
      if (resident.roomId) {
        const room = await mockRoomService.getById(resident.roomId);
        if (!room) {
          issues.push(`住民 ${resident.name} が存在しない部屋を参照しています`);
        }
      }
    }
    
    // 契約のない住民
    for (const resident of mockResidentData) {
      const contracts = await mockContractService.getByResidentId(resident.id);
      if (contracts.length === 0) {
        issues.push(`住民 ${resident.name} に契約がありません`);
      }
    }
    
    // 重複するユーザーID
    const userIds = mockResidentData.map(r => r.userId).filter(Boolean);
    const duplicateUserIds = userIds.filter((id, index) => userIds.indexOf(id) !== index);
    if (duplicateUserIds.length > 0) {
      issues.push(`重複するユーザーID: ${duplicateUserIds.join(', ')}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  },

  async fixDataIntegrity() {
    const integrity = await this.checkDataIntegrity();
    if (integrity.isValid) return { fixed: 0, issues: [] };
    
    let fixedCount = 0;
    
    // 孤立した部屋を削除
    const validMansionIds = mockMansionData.map(m => m.id);
    const orphanedRooms = mockRoomData.filter(r => !validMansionIds.includes(r.mansionId));
    for (const room of orphanedRooms) {
      mockRoomData = mockRoomData.filter(r => r.id !== room.id);
      fixedCount++;
    }
    
    // 孤立した住民の部屋IDをクリア
    const validRoomIds = mockRoomData.map(r => r.id);
    for (const resident of mockResidentData) {
      if (resident.roomId && !validRoomIds.includes(resident.roomId)) {
        const index = mockResidentData.findIndex(r => r.id === resident.id);
        if (index !== -1) {
          mockResidentData[index] = { ...resident, roomId: '' };
          fixedCount++;
        }
      }
    }
    
    return {
      fixed: fixedCount,
      issues: integrity.issues
    };
  }
};

// データリセット関数
export const mockDataResetService = {
  async resetAllData() {
    mockMansionData = [...mockMansions];
    mockRoomData = [...mockRooms];
    mockResidentData = [...mockResidents];
    mockContractorData = [...mockContractors];
    mockRepairData = [...mockRepairRecords];
    mockContractData = [...mockContracts];
    mockRequestData = [...mockResidentRequests];
    mockFinancialData = [...mockFinancialRecords];
    mockPaymentData = [...mockPaymentRecords];
    mockNotificationData = [...mockNotifications];
    
    return Promise.resolve({ success: true });
  },

  async exportData() {
    return Promise.resolve({
      mansions: [...mockMansionData],
      rooms: [...mockRoomData],
      residents: [...mockResidentData],
      contractors: [...mockContractorData],
      repairs: [...mockRepairData],
      contracts: [...mockContractData],
      requests: [...mockRequestData],
      financial: [...mockFinancialData],
      payments: [...mockPaymentData],
      notifications: [...mockNotificationData]
    });
  },

  async importData(data: any) {
    if (data.mansions) mockMansionData = [...data.mansions];
    if (data.rooms) mockRoomData = [...data.rooms];
    if (data.residents) mockResidentData = [...data.residents];
    if (data.contractors) mockContractorData = [...data.contractors];
    if (data.repairs) mockRepairData = [...data.repairs];
    if (data.contracts) mockContractData = [...data.contracts];
    if (data.requests) mockRequestData = [...data.requests];
    if (data.financial) mockFinancialData = [...data.financial];
    if (data.payments) mockPaymentData = [...data.payments];
    if (data.notifications) mockNotificationData = [...data.notifications];
    
    return Promise.resolve({ success: true });
  }
};