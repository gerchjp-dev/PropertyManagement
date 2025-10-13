import { getLibSQLDatabase } from '../lib/libsql';
import type { Mansion, Room, Resident, Contractor, RepairRecord } from '../types';

// LibSQLクライアントを取得し、未初期化の場合はエラーを投げる
const getDbOrThrow = () => {
  const db = getLibSQLDatabase();
  if (!db) {
    throw new Error('LibSQL client is not initialized. Please check VITE_LIBSQL_URL configuration.');
  }
  return db;
};

// LibSQL用のユーティリティ関数
const parseJSON = (jsonString: string | null): any[] => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};

const stringifyJSON = (data: any[]): string => {
  return JSON.stringify(data || []);
};

// 物件管理
export const libsqlMansionService = {
  async getAll(): Promise<Mansion[]> {
    try {
      const db = getDbOrThrow();
      const result = await db.execute(`
        SELECT 
          id, name, address, purchase_date, photo_paths,
          deed_pdf_path, total_rooms, occupancy_rate,
          created_at, updated_at
        FROM mansions 
        WHERE is_deleted = 0 
        ORDER BY created_at DESC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        purchaseDate: row.purchase_date,
        photoPaths: parseJSON(row.photo_paths),
        deedPdfPath: row.deed_pdf_path,
        totalRooms: row.total_rooms,
        occupancyRate: row.occupancy_rate || 0
      }));
    } catch (error) {
      console.error('Failed to fetch mansions from LibSQL:', error);
      throw error;
    }
  },

  async create(mansion: Omit<Mansion, 'id'>): Promise<Mansion> {
    try {
      const db = getDbOrThrow();
      const id = `mansion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.execute({
        sql: `
          INSERT INTO mansions (
            id, name, address, purchase_date, photo_paths, 
            deed_pdf_path, total_rooms, occupancy_rate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id, mansion.name, mansion.address, mansion.purchaseDate,
          stringifyJSON(mansion.photoPaths), mansion.deedPdfPath,
          mansion.totalRooms, mansion.occupancyRate
        ]
      });
      
      return { id, ...mansion };
    } catch (error) {
      console.error('Failed to create mansion in LibSQL:', error);
      throw error;
    }
  },

  async update(id: string, mansion: Partial<Mansion>): Promise<{ success: boolean }> {
    try {
      const db = getDbOrThrow();
      
      const updates: string[] = [];
      const args: any[] = [];
      
      if (mansion.name !== undefined) {
        updates.push('name = ?');
        args.push(mansion.name);
      }
      if (mansion.address !== undefined) {
        updates.push('address = ?');
        args.push(mansion.address);
      }
      if (mansion.purchaseDate !== undefined) {
        updates.push('purchase_date = ?');
        args.push(mansion.purchaseDate);
      }
      if (mansion.photoPaths !== undefined) {
        updates.push('photo_paths = ?');
        args.push(stringifyJSON(mansion.photoPaths));
      }
      if (mansion.totalRooms !== undefined) {
        updates.push('total_rooms = ?');
        args.push(mansion.totalRooms);
      }
      if (mansion.occupancyRate !== undefined) {
        updates.push('occupancy_rate = ?');
        args.push(mansion.occupancyRate);
      }
      
      updates.push('updated_at = datetime("now")');
      args.push(id);
      
      await db.execute({
        sql: `UPDATE mansions SET ${updates.join(', ')} WHERE id = ?`,
        args
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update mansion in LibSQL:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const db = getDbOrThrow();
      await db.execute({
        sql: `UPDATE mansions SET is_deleted = 1, deleted_date = datetime('now') WHERE id = ?`,
        args: [id]
      });
    } catch (error) {
      console.error('Failed to delete mansion in LibSQL:', error);
      throw error;
    }
  }
};

// 部屋管理
export const libsqlRoomService = {
  async getByMansionId(mansionId: string): Promise<Room[]> {
    try {
      const db = getDbOrThrow();
      const result = await db.execute({
        sql: `
          SELECT 
            id, mansion_id, room_number, layout, size, floor,
            photo_paths, condition_notes, is_occupied, monthly_rent,
            maintenance_fee, parking_fee, bicycle_parking_fee
          FROM rooms 
          WHERE mansion_id = ? AND is_deleted = 0 
          ORDER BY room_number
        `,
        args: [mansionId]
      });
      
      return result.rows.map((row: any) => ({
        id: row.id,
        mansionId: row.mansion_id,
        roomNumber: row.room_number,
        layout: row.layout,
        size: row.size,
        floor: row.floor,
        photoPaths: parseJSON(row.photo_paths),
        conditionNotes: row.condition_notes || '',
        isOccupied: Boolean(row.is_occupied),
        monthlyRent: row.monthly_rent,
        maintenanceFee: row.maintenance_fee || 0,
        parkingFee: row.parking_fee || 0,
        bicycleParkingFee: row.bicycle_parking_fee || 0
      }));
    } catch (error) {
      console.error('Failed to fetch rooms from LibSQL:', error);
      throw error;
    }
  },

  async create(room: Omit<Room, 'id'>): Promise<Room> {
    try {
      const db = getDbOrThrow();
      const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.execute({
        sql: `
          INSERT INTO rooms (
            id, mansion_id, room_number, layout, size, floor,
            photo_paths, condition_notes, is_occupied, monthly_rent,
            maintenance_fee, parking_fee, bicycle_parking_fee
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id, room.mansionId, room.roomNumber, room.layout,
          room.size, room.floor, stringifyJSON(room.photoPaths),
          room.conditionNotes, room.isOccupied ? 1 : 0, room.monthlyRent,
          room.maintenanceFee, room.parkingFee, room.bicycleParkingFee
        ]
      });
      
      return { id, ...room };
    } catch (error) {
      console.error('Failed to create room in LibSQL:', error);
      throw error;
    }
  },

  async update(id: string, room: Partial<Room>): Promise<{ success: boolean }> {
    try {
      const db = getDbOrThrow();
      
      const updates: string[] = [];
      const args: any[] = [];
      
      if (room.mansionId !== undefined) {
        updates.push('mansion_id = ?');
        args.push(room.mansionId);
      }
      if (room.roomNumber !== undefined) {
        updates.push('room_number = ?');
        args.push(room.roomNumber);
      }
      if (room.layout !== undefined) {
        updates.push('layout = ?');
        args.push(room.layout);
      }
      if (room.size !== undefined) {
        updates.push('size = ?');
        args.push(room.size);
      }
      if (room.floor !== undefined) {
        updates.push('floor = ?');
        args.push(room.floor);
      }
      if (room.photoPaths !== undefined) {
        updates.push('photo_paths = ?');
        args.push(stringifyJSON(room.photoPaths));
      }
      if (room.conditionNotes !== undefined) {
        updates.push('condition_notes = ?');
        args.push(room.conditionNotes);
      }
      if (room.isOccupied !== undefined) {
        updates.push('is_occupied = ?');
        args.push(room.isOccupied ? 1 : 0);
      }
      if (room.monthlyRent !== undefined) {
        updates.push('monthly_rent = ?');
        args.push(room.monthlyRent);
      }
      if (room.maintenanceFee !== undefined) {
        updates.push('maintenance_fee = ?');
        args.push(room.maintenanceFee);
      }
      if (room.parkingFee !== undefined) {
        updates.push('parking_fee = ?');
        args.push(room.parkingFee);
      }
      
      updates.push('updated_at = datetime("now")');
      args.push(id);
      
      await db.execute({
        sql: `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
        args
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update room in LibSQL:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const db = getDbOrThrow();
      await db.execute({
        sql: `UPDATE rooms SET is_deleted = 1, deleted_date = datetime('now') WHERE id = ?`,
        args: [id]
      });
    } catch (error) {
      console.error('Failed to delete room in LibSQL:', error);
      throw error;
    }
  }
};

// 住民管理
export const libsqlResidentService = {
  async getAll(includeDeleted = false): Promise<Resident[]> {
    try {
      const db = getDbOrThrow();
      const whereClause = includeDeleted ? '' : 'WHERE is_deleted = 0';
      
      const result = await db.execute(`
        SELECT 
          id, room_id, name, phone, email, move_in_date,
          emergency_contact, user_id, password, is_active
        FROM residents 
        ${whereClause}
        ORDER BY created_at DESC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        roomId: row.room_id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        moveInDate: row.move_in_date,
        emergencyContact: row.emergency_contact,
        userId: row.user_id,
        password: row.password,
        isActive: Boolean(row.is_active)
      }));
    } catch (error) {
      console.error('Failed to fetch residents from LibSQL:', error);
      throw error;
    }
  },

  async create(resident: Omit<Resident, 'id'>): Promise<Resident> {
    try {
      const db = getDbOrThrow();
      const id = `resident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.execute({
        sql: `
          INSERT INTO residents (
            id, room_id, name, phone, email, move_in_date,
            emergency_contact, user_id, password, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id, resident.roomId, resident.name, resident.phone,
          resident.email, resident.moveInDate, resident.emergencyContact,
          resident.userId, resident.password, resident.isActive ? 1 : 0
        ]
      });
      
      return { id, ...resident };
    } catch (error) {
      console.error('Failed to create resident in LibSQL:', error);
      throw error;
    }
  },

  async update(id: string, resident: Partial<Resident>): Promise<{ success: boolean }> {
    try {
      const db = getDbOrThrow();
      
      const updates: string[] = [];
      const args: any[] = [];
      
      if (resident.roomId !== undefined) {
        updates.push('room_id = ?');
        args.push(resident.roomId);
      }
      if (resident.name !== undefined) {
        updates.push('name = ?');
        args.push(resident.name);
      }
      if (resident.phone !== undefined) {
        updates.push('phone = ?');
        args.push(resident.phone);
      }
      if (resident.email !== undefined) {
        updates.push('email = ?');
        args.push(resident.email);
      }
      if (resident.moveInDate !== undefined) {
        updates.push('move_in_date = ?');
        args.push(resident.moveInDate);
      }
      if (resident.emergencyContact !== undefined) {
        updates.push('emergency_contact = ?');
        args.push(resident.emergencyContact);
      }
      if (resident.userId !== undefined) {
        updates.push('user_id = ?');
        args.push(resident.userId);
      }
      if (resident.password !== undefined) {
        updates.push('password = ?');
        args.push(resident.password);
      }
      if (resident.isActive !== undefined) {
        updates.push('is_active = ?');
        args.push(resident.isActive ? 1 : 0);
      }
      
      updates.push('updated_at = datetime("now")');
      args.push(id);
      
      await db.execute({
        sql: `UPDATE residents SET ${updates.join(', ')} WHERE id = ?`,
        args
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update resident in LibSQL:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const db = getDbOrThrow();
      await db.execute({
        sql: `UPDATE residents SET is_deleted = 1, deleted_date = datetime('now') WHERE id = ?`,
        args: [id]
      });
    } catch (error) {
      console.error('Failed to delete resident in LibSQL:', error);
      throw error;
    }
  }
};

// 業者管理
export const libsqlContractorService = {
  async getAll(includeDeleted = false): Promise<Contractor[]> {
    try {
      const db = getDbOrThrow();
      const whereClause = includeDeleted ? '' : 'WHERE is_deleted = 0';
      
      const result = await db.execute(`
        SELECT 
          id, name, contact_person, phone, email, address,
          specialties, hourly_rate, rating, is_active, 
          last_work_date, notes
        FROM contractors 
        ${whereClause}
        ORDER BY created_at DESC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        contactPerson: row.contact_person,
        phone: row.phone,
        email: row.email,
        address: row.address,
        specialties: parseJSON(row.specialties),
        hourlyRate: row.hourly_rate || 0,
        rating: row.rating || 3,
        isActive: Boolean(row.is_active),
        lastWorkDate: row.last_work_date,
        notes: row.notes
      }));
    } catch (error) {
      console.error('Failed to fetch contractors from LibSQL:', error);
      throw error;
    }
  },

  async create(contractor: Omit<Contractor, 'id'>): Promise<Contractor> {
    try {
      const db = getDbOrThrow();
      const id = `contractor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.execute({
        sql: `
          INSERT INTO contractors (
            id, name, contact_person, phone, email, address,
            specialties, hourly_rate, rating, is_active, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id, contractor.name, contractor.contactPerson, contractor.phone,
          contractor.email, contractor.address, stringifyJSON(contractor.specialties),
          contractor.hourlyRate, contractor.rating, contractor.isActive ? 1 : 0,
          contractor.notes
        ]
      });
      
      return { id, ...contractor };
    } catch (error) {
      console.error('Failed to create contractor in LibSQL:', error);
      throw error;
    }
  },

  async update(id: string, contractor: Partial<Contractor>): Promise<{ success: boolean }> {
    try {
      const db = getDbOrThrow();
      
      const updates: string[] = [];
      const args: any[] = [];
      
      if (contractor.name !== undefined) {
        updates.push('name = ?');
        args.push(contractor.name);
      }
      if (contractor.contactPerson !== undefined) {
        updates.push('contact_person = ?');
        args.push(contractor.contactPerson);
      }
      if (contractor.phone !== undefined) {
        updates.push('phone = ?');
        args.push(contractor.phone);
      }
      if (contractor.email !== undefined) {
        updates.push('email = ?');
        args.push(contractor.email);
      }
      if (contractor.address !== undefined) {
        updates.push('address = ?');
        args.push(contractor.address);
      }
      if (contractor.specialties !== undefined) {
        updates.push('specialties = ?');
        args.push(stringifyJSON(contractor.specialties));
      }
      if (contractor.hourlyRate !== undefined) {
        updates.push('hourly_rate = ?');
        args.push(contractor.hourlyRate);
      }
      if (contractor.rating !== undefined) {
        updates.push('rating = ?');
        args.push(contractor.rating);
      }
      if (contractor.isActive !== undefined) {
        updates.push('is_active = ?');
        args.push(contractor.isActive ? 1 : 0);
      }
      if (contractor.notes !== undefined) {
        updates.push('notes = ?');
        args.push(contractor.notes);
      }
      
      updates.push('updated_at = datetime("now")');
      args.push(id);
      
      await db.execute({
        sql: `UPDATE contractors SET ${updates.join(', ')} WHERE id = ?`,
        args
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update contractor in LibSQL:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const db = getDbOrThrow();
      await db.execute({
        sql: `UPDATE contractors SET is_deleted = 1, deleted_date = datetime('now') WHERE id = ?`,
        args: [id]
      });
    } catch (error) {
      console.error('Failed to delete contractor in LibSQL:', error);
      throw error;
    }
  }
};

// 修繕管理
export const libsqlRepairService = {
  async getAll(includeDeleted = false): Promise<RepairRecord[]> {
    try {
      const db = getDbOrThrow();
      const whereClause = includeDeleted ? '' : 'WHERE is_deleted = 0';
      
      const result = await db.execute(`
        SELECT 
          id, room_id, mansion_id, contractor_id, scope, description,
          request_date, start_date, completion_date, cost, estimated_cost,
          contractor_name, photo_paths, report_pdf_path, status,
          priority, category, notes
        FROM repair_records 
        ${whereClause}
        ORDER BY created_at DESC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        roomId: row.room_id,
        mansionId: row.mansion_id,
        contractorId: row.contractor_id,
        scope: row.scope,
        description: row.description,
        requestDate: row.request_date,
        startDate: row.start_date,
        completionDate: row.completion_date,
        cost: row.cost || 0,
        estimatedCost: row.estimated_cost || 0,
        contractor: row.contractor_name,
        photoPaths: parseJSON(row.photo_paths),
        reportPdfPath: row.report_pdf_path,
        status: row.status,
        priority: row.priority,
        category: row.category,
        notes: row.notes,
        progressSteps: [] // TODO: 進捗ステップの実装
      }));
    } catch (error) {
      console.error('Failed to fetch repair records from LibSQL:', error);
      throw error;
    }
  },

  async create(repair: Omit<RepairRecord, 'id' | 'progressSteps'>): Promise<RepairRecord> {
    try {
      const db = getDbOrThrow();
      const id = `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.execute({
        sql: `
          INSERT INTO repair_records (
            id, room_id, mansion_id, contractor_id, scope, description,
            request_date, start_date, estimated_cost, contractor_name,
            photo_paths, status, priority, category, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id, repair.roomId, repair.mansionId, repair.contractorId,
          repair.scope, repair.description, repair.requestDate,
          repair.startDate, repair.estimatedCost, repair.contractor,
          stringifyJSON(repair.photoPaths), repair.status, repair.priority,
          repair.category, repair.notes
        ]
      });
      
      return {
        id,
        ...repair,
        progressSteps: []
      };
    } catch (error) {
      console.error('Failed to create repair record in LibSQL:', error);
      throw error;
    }
  },

  async update(id: string, repair: Partial<RepairRecord>): Promise<{ success: boolean }> {
    try {
      const db = getDbOrThrow();
      
      const updates: string[] = [];
      const args: any[] = [];
      
      if (repair.roomId !== undefined) {
        updates.push('room_id = ?');
        args.push(repair.roomId);
      }
      if (repair.mansionId !== undefined) {
        updates.push('mansion_id = ?');
        args.push(repair.mansionId);
      }
      if (repair.contractorId !== undefined) {
        updates.push('contractor_id = ?');
        args.push(repair.contractorId);
      }
      if (repair.scope !== undefined) {
        updates.push('scope = ?');
        args.push(repair.scope);
      }
      if (repair.description !== undefined) {
        updates.push('description = ?');
        args.push(repair.description);
      }
      if (repair.requestDate !== undefined) {
        updates.push('request_date = ?');
        args.push(repair.requestDate);
      }
      if (repair.startDate !== undefined) {
        updates.push('start_date = ?');
        args.push(repair.startDate);
      }
      if (repair.completionDate !== undefined) {
        updates.push('completion_date = ?');
        args.push(repair.completionDate);
      }
      if (repair.cost !== undefined) {
        updates.push('cost = ?');
        args.push(repair.cost);
      }
      if (repair.estimatedCost !== undefined) {
        updates.push('estimated_cost = ?');
        args.push(repair.estimatedCost);
      }
      if (repair.contractor !== undefined) {
        updates.push('contractor_name = ?');
        args.push(repair.contractor);
      }
      if (repair.photoPaths !== undefined) {
        updates.push('photo_paths = ?');
        args.push(stringifyJSON(repair.photoPaths));
      }
      if (repair.status !== undefined) {
        updates.push('status = ?');
        args.push(repair.status);
      }
      if (repair.priority !== undefined) {
        updates.push('priority = ?');
        args.push(repair.priority);
      }
      if (repair.category !== undefined) {
        updates.push('category = ?');
        args.push(repair.category);
      }
      if (repair.notes !== undefined) {
        updates.push('notes = ?');
        args.push(repair.notes);
      }
      
      updates.push('updated_at = datetime("now")');
      args.push(id);
      
      await db.execute({
        sql: `UPDATE repair_records SET ${updates.join(', ')} WHERE id = ?`,
        args
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update repair record in LibSQL:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const db = getDbOrThrow();
      await db.execute({
        sql: `UPDATE repair_records SET is_deleted = 1, deleted_date = datetime('now') WHERE id = ?`,
        args: [id]
      });
    } catch (error) {
      console.error('Failed to delete repair record in LibSQL:', error);
      throw error;
    }
  }
};