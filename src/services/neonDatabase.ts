import { db } from '../lib/neon';
import { sql } from 'drizzle-orm';
import type { Mansion, Room, Resident, Contractor, RepairRecord } from '../types';

// 物件管理
export const neonMansionService = {
  async getAll(): Promise<Mansion[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          id,
          name,
          address,
          purchase_date,
          photo_paths,
          deed_pdf_path,
          total_rooms,
          occupancy_rate,
          created_at,
          updated_at
        FROM mansions 
        WHERE is_deleted = false 
        ORDER BY created_at DESC
      `);
      
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        purchaseDate: row.purchase_date,
        photoPaths: row.photo_paths || [],
        deedPdfPath: row.deed_pdf_path,
        totalRooms: row.total_rooms,
        occupancyRate: row.occupancy_rate || 0
      }));
    } catch (error) {
      console.error('Failed to fetch mansions from Neon:', error);
      throw error;
    }
  },

  async create(mansion: Omit<Mansion, 'id'>): Promise<Mansion> {
    try {
      const result = await db.execute(sql`
        INSERT INTO mansions (
          name, address, purchase_date, photo_paths, 
          deed_pdf_path, total_rooms, occupancy_rate
        ) VALUES (
          ${mansion.name}, ${mansion.address}, ${mansion.purchaseDate}, 
          ${mansion.photoPaths}, ${mansion.deedPdfPath}, 
          ${mansion.totalRooms}, ${mansion.occupancyRate}
        ) RETURNING *
      `);
      
      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        address: row.address,
        purchaseDate: row.purchase_date,
        photoPaths: row.photo_paths || [],
        deedPdfPath: row.deed_pdf_path,
        totalRooms: row.total_rooms,
        occupancyRate: row.occupancy_rate || 0
      };
    } catch (error) {
      console.error('Failed to create mansion in Neon:', error);
      throw error;
    }
  },

  async update(id: string, mansion: Partial<Mansion>): Promise<{ success: boolean }> {
    try {
      await db.execute(sql`
        UPDATE mansions 
        SET 
          name = COALESCE(${mansion.name}, name),
          address = COALESCE(${mansion.address}, address),
          purchase_date = COALESCE(${mansion.purchaseDate}, purchase_date),
          photo_paths = COALESCE(${mansion.photoPaths}, photo_paths),
          deed_pdf_path = COALESCE(${mansion.deedPdfPath}, deed_pdf_path),
          total_rooms = COALESCE(${mansion.totalRooms}, total_rooms),
          occupancy_rate = COALESCE(${mansion.occupancyRate}, occupancy_rate),
          updated_at = NOW()
        WHERE id = ${id}
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update mansion in Neon:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE mansions 
        SET is_deleted = true, deleted_date = NOW() 
        WHERE id = ${id}
      `);
    } catch (error) {
      console.error('Failed to delete mansion in Neon:', error);
      throw error;
    }
  }
};

// 部屋管理
export const neonRoomService = {
  async getByMansionId(mansionId: string): Promise<Room[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          id, mansion_id, room_number, layout, size, floor,
          photo_paths, condition_notes, is_occupied, monthly_rent,
          maintenance_fee, parking_fee, bicycle_parking_fee
        FROM rooms 
        WHERE mansion_id = ${mansionId} AND is_deleted = false 
        ORDER BY room_number
      `);
      
      return result.map((row: any) => ({
        id: row.id,
        mansionId: row.mansion_id,
        roomNumber: row.room_number,
        layout: row.layout,
        size: row.size,
        floor: row.floor,
        photoPaths: row.photo_paths || [],
        conditionNotes: row.condition_notes || '',
        isOccupied: row.is_occupied || false,
        monthlyRent: row.monthly_rent,
        maintenanceFee: row.maintenance_fee || 0,
        parkingFee: row.parking_fee || 0,
        bicycleParkingFee: row.bicycle_parking_fee || 0
      }));
    } catch (error) {
      console.error('Failed to fetch rooms from Neon:', error);
      throw error;
    }
  },

  async create(room: Omit<Room, 'id'>): Promise<Room> {
    try {
      const result = await db.execute(sql`
        INSERT INTO rooms (
          mansion_id, room_number, layout, size, floor,
          photo_paths, condition_notes, is_occupied, monthly_rent,
          maintenance_fee, parking_fee, bicycle_parking_fee
        ) VALUES (
          ${room.mansionId}, ${room.roomNumber}, ${room.layout}, 
          ${room.size}, ${room.floor}, ${room.photoPaths}, 
          ${room.conditionNotes}, ${room.isOccupied}, ${room.monthlyRent},
          ${room.maintenanceFee}, ${room.parkingFee}, ${room.bicycleParkingFee}
        ) RETURNING *
      `);
      
      const row = result[0];
      return {
        id: row.id,
        mansionId: row.mansion_id,
        roomNumber: row.room_number,
        layout: row.layout,
        size: row.size,
        floor: row.floor,
        photoPaths: row.photo_paths || [],
        conditionNotes: row.condition_notes || '',
        isOccupied: row.is_occupied || false,
        monthlyRent: row.monthly_rent,
        maintenanceFee: row.maintenance_fee || 0,
        parkingFee: row.parking_fee || 0,
        bicycleParkingFee: row.bicycle_parking_fee || 0
      };
    } catch (error) {
      console.error('Failed to create room in Neon:', error);
      throw error;
    }
  },

  async update(id: string, room: Partial<Room>): Promise<{ success: boolean }> {
    try {
      await db.execute(sql`
        UPDATE rooms 
        SET 
          mansion_id = COALESCE(${room.mansionId}, mansion_id),
          room_number = COALESCE(${room.roomNumber}, room_number),
          layout = COALESCE(${room.layout}, layout),
          size = COALESCE(${room.size}, size),
          floor = COALESCE(${room.floor}, floor),
          photo_paths = COALESCE(${room.photoPaths}, photo_paths),
          condition_notes = COALESCE(${room.conditionNotes}, condition_notes),
          is_occupied = COALESCE(${room.isOccupied}, is_occupied),
          monthly_rent = COALESCE(${room.monthlyRent}, monthly_rent),
          maintenance_fee = COALESCE(${room.maintenanceFee}, maintenance_fee),
          parking_fee = COALESCE(${room.parkingFee}, parking_fee),
          bicycle_parking_fee = COALESCE(${room.bicycleParkingFee}, bicycle_parking_fee),
          updated_at = NOW()
        WHERE id = ${id}
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update room in Neon:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE rooms 
        SET is_deleted = true, deleted_date = NOW() 
        WHERE id = ${id}
      `);
    } catch (error) {
      console.error('Failed to delete room in Neon:', error);
      throw error;
    }
  }
};

// 住民管理
export const neonResidentService = {
  async getAll(includeDeleted = false): Promise<Resident[]> {
    try {
      const whereClause = includeDeleted ? '' : 'WHERE is_deleted = false';
      
      const result = await db.execute(sql`
        SELECT 
          id, room_id, name, phone, email, move_in_date,
          emergency_contact, user_id, password, is_active
        FROM residents 
        ${sql.raw(whereClause)}
        ORDER BY created_at DESC
      `);
      
      return result.map((row: any) => ({
        id: row.id,
        roomId: row.room_id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        moveInDate: row.move_in_date,
        emergencyContact: row.emergency_contact,
        userId: row.user_id,
        password: row.password,
        isActive: row.is_active
      }));
    } catch (error) {
      console.error('Failed to fetch residents from Neon:', error);
      throw error;
    }
  },

  async create(resident: Omit<Resident, 'id'>): Promise<Resident> {
    try {
      const result = await db.execute(sql`
        INSERT INTO residents (
          room_id, name, phone, email, move_in_date,
          emergency_contact, user_id, password, is_active
        ) VALUES (
          ${resident.roomId}, ${resident.name}, ${resident.phone}, 
          ${resident.email}, ${resident.moveInDate}, ${resident.emergencyContact},
          ${resident.userId}, ${resident.password}, ${resident.isActive}
        ) RETURNING *
      `);
      
      const row = result[0];
      return {
        id: row.id,
        roomId: row.room_id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        moveInDate: row.move_in_date,
        emergencyContact: row.emergency_contact,
        userId: row.user_id,
        password: row.password,
        isActive: row.is_active
      };
    } catch (error) {
      console.error('Failed to create resident in Neon:', error);
      throw error;
    }
  },

  async update(id: string, resident: Partial<Resident>): Promise<{ success: boolean }> {
    try {
      await db.execute(sql`
        UPDATE residents 
        SET 
          room_id = COALESCE(${resident.roomId}, room_id),
          name = COALESCE(${resident.name}, name),
          phone = COALESCE(${resident.phone}, phone),
          email = COALESCE(${resident.email}, email),
          move_in_date = COALESCE(${resident.moveInDate}, move_in_date),
          emergency_contact = COALESCE(${resident.emergencyContact}, emergency_contact),
          user_id = COALESCE(${resident.userId}, user_id),
          password = COALESCE(${resident.password}, password),
          is_active = COALESCE(${resident.isActive}, is_active),
          updated_at = NOW()
        WHERE id = ${id}
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update resident in Neon:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE residents 
        SET is_deleted = true, deleted_date = NOW() 
        WHERE id = ${id}
      `);
    } catch (error) {
      console.error('Failed to delete resident in Neon:', error);
      throw error;
    }
  }
};

// 業者管理
export const neonContractorService = {
  async getAll(includeDeleted = false): Promise<Contractor[]> {
    try {
      const whereClause = includeDeleted ? '' : 'WHERE is_deleted = false';
      
      const result = await db.execute(sql`
        SELECT 
          id, name, contact_person, phone, email, address,
          specialties, hourly_rate, rating, is_active, 
          last_work_date, notes
        FROM contractors 
        ${sql.raw(whereClause)}
        ORDER BY created_at DESC
      `);
      
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        contactPerson: row.contact_person,
        phone: row.phone,
        email: row.email,
        address: row.address,
        specialties: row.specialties || [],
        hourlyRate: row.hourly_rate || 0,
        rating: row.rating || 3,
        isActive: row.is_active,
        lastWorkDate: row.last_work_date,
        notes: row.notes
      }));
    } catch (error) {
      console.error('Failed to fetch contractors from Neon:', error);
      throw error;
    }
  },

  async create(contractor: Omit<Contractor, 'id'>): Promise<Contractor> {
    try {
      const result = await db.execute(sql`
        INSERT INTO contractors (
          name, contact_person, phone, email, address,
          specialties, hourly_rate, rating, is_active, notes
        ) VALUES (
          ${contractor.name}, ${contractor.contactPerson}, ${contractor.phone},
          ${contractor.email}, ${contractor.address}, ${contractor.specialties},
          ${contractor.hourlyRate}, ${contractor.rating}, ${contractor.isActive},
          ${contractor.notes}
        ) RETURNING *
      `);
      
      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        contactPerson: row.contact_person,
        phone: row.phone,
        email: row.email,
        address: row.address,
        specialties: row.specialties || [],
        hourlyRate: row.hourly_rate || 0,
        rating: row.rating || 3,
        isActive: row.is_active,
        lastWorkDate: row.last_work_date,
        notes: row.notes
      };
    } catch (error) {
      console.error('Failed to create contractor in Neon:', error);
      throw error;
    }
  },

  async update(id: string, contractor: Partial<Contractor>): Promise<{ success: boolean }> {
    try {
      await db.execute(sql`
        UPDATE contractors 
        SET 
          name = COALESCE(${contractor.name}, name),
          contact_person = COALESCE(${contractor.contactPerson}, contact_person),
          phone = COALESCE(${contractor.phone}, phone),
          email = COALESCE(${contractor.email}, email),
          address = COALESCE(${contractor.address}, address),
          specialties = COALESCE(${contractor.specialties}, specialties),
          hourly_rate = COALESCE(${contractor.hourlyRate}, hourly_rate),
          rating = COALESCE(${contractor.rating}, rating),
          is_active = COALESCE(${contractor.isActive}, is_active),
          notes = COALESCE(${contractor.notes}, notes),
          updated_at = NOW()
        WHERE id = ${id}
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update contractor in Neon:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE contractors 
        SET is_deleted = true, deleted_date = NOW() 
        WHERE id = ${id}
      `);
    } catch (error) {
      console.error('Failed to delete contractor in Neon:', error);
      throw error;
    }
  }
};

// 修繕管理
export const neonRepairService = {
  async getAll(includeDeleted = false): Promise<RepairRecord[]> {
    try {
      const whereClause = includeDeleted ? '' : 'WHERE is_deleted = false';
      
      const result = await db.execute(sql`
        SELECT 
          id, room_id, mansion_id, contractor_id, scope, description,
          request_date, start_date, completion_date, cost, estimated_cost,
          contractor_name, photo_paths, report_pdf_path, status,
          priority, category, notes
        FROM repair_records 
        ${sql.raw(whereClause)}
        ORDER BY created_at DESC
      `);
      
      return result.map((row: any) => ({
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
        photoPaths: row.photo_paths || [],
        reportPdfPath: row.report_pdf_path,
        status: row.status,
        priority: row.priority,
        category: row.category,
        notes: row.notes,
        progressSteps: [] // TODO: 進捗ステップの実装
      }));
    } catch (error) {
      console.error('Failed to fetch repair records from Neon:', error);
      throw error;
    }
  },

  async create(repair: Omit<RepairRecord, 'id' | 'progressSteps'>): Promise<RepairRecord> {
    try {
      const result = await db.execute(sql`
        INSERT INTO repair_records (
          room_id, mansion_id, contractor_id, scope, description,
          request_date, start_date, estimated_cost, contractor_name,
          photo_paths, status, priority, category, notes
        ) VALUES (
          ${repair.roomId}, ${repair.mansionId}, ${repair.contractorId},
          ${repair.scope}, ${repair.description}, ${repair.requestDate},
          ${repair.startDate}, ${repair.estimatedCost}, ${repair.contractor},
          ${repair.photoPaths}, ${repair.status}, ${repair.priority},
          ${repair.category}, ${repair.notes}
        ) RETURNING *
      `);
      
      const row = result[0];
      return {
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
        photoPaths: row.photo_paths || [],
        reportPdfPath: row.report_pdf_path,
        status: row.status,
        priority: row.priority,
        category: row.category,
        notes: row.notes,
        progressSteps: []
      };
    } catch (error) {
      console.error('Failed to create repair record in Neon:', error);
      throw error;
    }
  },

  async update(id: string, repair: Partial<RepairRecord>): Promise<{ success: boolean }> {
    try {
      await db.execute(sql`
        UPDATE repair_records 
        SET 
          room_id = COALESCE(${repair.roomId}, room_id),
          mansion_id = COALESCE(${repair.mansionId}, mansion_id),
          contractor_id = COALESCE(${repair.contractorId}, contractor_id),
          scope = COALESCE(${repair.scope}, scope),
          description = COALESCE(${repair.description}, description),
          request_date = COALESCE(${repair.requestDate}, request_date),
          start_date = COALESCE(${repair.startDate}, start_date),
          completion_date = COALESCE(${repair.completionDate}, completion_date),
          cost = COALESCE(${repair.cost}, cost),
          estimated_cost = COALESCE(${repair.estimatedCost}, estimated_cost),
          contractor_name = COALESCE(${repair.contractor}, contractor_name),
          photo_paths = COALESCE(${repair.photoPaths}, photo_paths),
          status = COALESCE(${repair.status}, status),
          priority = COALESCE(${repair.priority}, priority),
          category = COALESCE(${repair.category}, category),
          notes = COALESCE(${repair.notes}, notes),
          updated_at = NOW()
        WHERE id = ${id}
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update repair record in Neon:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE repair_records 
        SET is_deleted = true, deleted_date = NOW() 
        WHERE id = ${id}
      `);
    } catch (error) {
      console.error('Failed to delete repair record in Neon:', error);
      throw error;
    }
  }
};