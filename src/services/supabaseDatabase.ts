import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// 物件管理
export const mansionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('mansions')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(mansion: Tables['mansions']['Insert']) {
    const { data, error } = await supabase
      .from('mansions')
      .insert(mansion)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, mansion: Tables['mansions']['Update']) {
    const { error } = await supabase
      .from('mansions')
      .update(mansion)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('mansions')
      .update({ 
        is_deleted: true, 
        deleted_date: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// 部屋管理
export const roomService = {
  async getByMansionId(mansionId: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('mansion_id', mansionId)
      .eq('is_deleted', false)
      .order('room_number');
    
    if (error) throw error;
    // Map snake_case to camelCase for frontend compatibility
    return data?.map(room => ({
      ...room,
      mansionId: room.mansion_id,
      roomNumber: room.room_number,
      photoPaths: room.photo_paths,
      conditionNotes: room.condition_notes,
      isOccupied: room.is_occupied,
      monthlyRent: room.monthly_rent,
      maintenanceFee: room.maintenance_fee,
      parkingFee: room.parking_fee,
      isDeleted: room.is_deleted,
      deletedDate: room.deleted_date,
      createdAt: room.created_at,
      updatedAt: room.updated_at
    })) || [];
  },

  async create(room: Tables['rooms']['Insert']) {
    // Map camelCase to snake_case for database
    const dbRoom = {
      mansion_id: room.mansionId,
      room_number: room.roomNumber,
      layout: room.layout,
      size: room.size,
      floor: room.floor,
      photo_paths: room.photoPaths || [],
      condition_notes: room.conditionNotes || '',
      is_occupied: room.isOccupied || false,
      monthly_rent: room.monthlyRent,
      maintenance_fee: room.maintenanceFee || 0,
      parking_fee: room.parkingFee || 0,
      bicycle_parking_fee: room.bicycleParkingFee || 0,
      is_deleted: false
    };

    const { data, error } = await supabase
      .from('rooms')
      .insert(dbRoom)
      .select()
      .single();
    
    if (error) throw error;
    // Map response back to camelCase
    return {
      ...data,
      mansionId: data.mansion_id,
      roomNumber: data.room_number,
      photoPaths: data.photo_paths,
      conditionNotes: data.condition_notes,
      isOccupied: data.is_occupied,
      monthlyRent: data.monthly_rent,
      maintenanceFee: data.maintenance_fee,
      parkingFee: data.parking_fee,
      bicycleParkingFee: data.bicycle_parking_fee,
      isDeleted: data.is_deleted,
      deletedDate: data.deleted_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async update(id: string, room: Tables['rooms']['Update']) {
    // Map camelCase to snake_case for database
    const dbRoom: any = {};
    if (room.mansionId !== undefined) dbRoom.mansion_id = room.mansionId;
    if (room.roomNumber !== undefined) dbRoom.room_number = room.roomNumber;
    if (room.layout !== undefined) dbRoom.layout = room.layout;
    if (room.size !== undefined) dbRoom.size = room.size;
    if (room.floor !== undefined) dbRoom.floor = room.floor;
    if (room.photoPaths !== undefined) dbRoom.photo_paths = room.photoPaths;
    if (room.conditionNotes !== undefined) dbRoom.condition_notes = room.conditionNotes;
    if (room.isOccupied !== undefined) dbRoom.is_occupied = room.isOccupied;
    if (room.monthlyRent !== undefined) dbRoom.monthly_rent = room.monthlyRent;
    if (room.maintenanceFee !== undefined) dbRoom.maintenance_fee = room.maintenanceFee;
    if (room.parkingFee !== undefined) dbRoom.parking_fee = room.parkingFee;
    if (room.bicycleParkingFee !== undefined) dbRoom.bicycle_parking_fee = room.bicycleParkingFee;

    const { error } = await supabase
      .from('rooms')
      .update(dbRoom)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('rooms')
      .update({ 
        is_deleted: true, 
        deleted_date: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// 住民管理
export const residentService = {
  async getAll(includeDeleted = false) {
    let query = supabase
      .from('residents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(resident: Tables['residents']['Insert']) {
    const { data, error } = await supabase
      .from('residents')
      .insert(resident)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, resident: Tables['residents']['Update']) {
    const { error } = await supabase
      .from('residents')
      .update(resident)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('residents')
      .update({ 
        is_deleted: true, 
        deleted_date: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// 業者管理
export const contractorService = {
  async getAll(includeDeleted = false) {
    let query = supabase
      .from('contractors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(contractor: Tables['contractors']['Insert']) {
    const { data, error } = await supabase
      .from('contractors')
      .insert(contractor)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, contractor: Tables['contractors']['Update']) {
    const { error } = await supabase
      .from('contractors')
      .update(contractor)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contractors')
      .update({ 
        is_deleted: true, 
        deleted_date: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// 修繕管理
export const repairService = {
  async getAll(includeDeleted = false) {
    let query = supabase
      .from('repair_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(repair: Tables['repair_records']['Insert']) {
    const { data, error } = await supabase
      .from('repair_records')
      .insert(repair)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, repair: Tables['repair_records']['Update']) {
    const { error } = await supabase
      .from('repair_records')
      .update(repair)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('repair_records')
      .update({ 
        is_deleted: true, 
        deleted_date: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};