import { pgTable, uuid, text, date, integer, decimal, boolean, timestamptz, textArray, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const repairScopeEnum = pgEnum('repair_scope', ['room', 'building']);
export const repairStatusEnum = pgEnum('repair_status', ['pending', 'in-progress', 'completed']);
export const repairPriorityEnum = pgEnum('repair_priority', ['low', 'medium', 'high', 'urgent']);
export const repairCategoryEnum = pgEnum('repair_category', ['plumbing', 'electrical', 'interior', 'exterior', 'equipment', 'other']);

// 物件テーブル
export const mansions = pgTable('mansions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  purchaseDate: date('purchase_date').notNull(),
  photoPaths: textArray('photo_paths').default([]),
  deedPdfPath: text('deed_pdf_path'),
  totalRooms: integer('total_rooms').notNull().default(0),
  occupancyRate: decimal('occupancy_rate', { precision: 5, scale: 2 }).default('0'),
  isDeleted: boolean('is_deleted').default(false),
  deletedDate: timestamptz('deleted_date'),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
});

// 部屋テーブル
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  mansionId: uuid('mansion_id').references(() => mansions.id, { onDelete: 'cascade' }),
  roomNumber: text('room_number').notNull(),
  layout: text('layout').notNull(),
  size: decimal('size', { precision: 6, scale: 2 }).notNull(),
  floor: integer('floor').notNull(),
  photoPaths: textArray('photo_paths').default([]),
  conditionNotes: text('condition_notes').default(''),
  isOccupied: boolean('is_occupied').default(false),
  monthlyRent: integer('monthly_rent').notNull().default(0),
  maintenanceFee: integer('maintenance_fee').default(0),
  parkingFee: integer('parking_fee').default(0),
  bicycleParkingFee: integer('bicycle_parking_fee').default(0),
  isDeleted: boolean('is_deleted').default(false),
  deletedDate: timestamptz('deleted_date'),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
});

// 住民テーブル
export const residents = pgTable('residents', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  moveInDate: date('move_in_date').notNull(),
  emergencyContact: text('emergency_contact').notNull(),
  userId: text('user_id').unique(),
  password: text('password'),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  deletedDate: timestamptz('deleted_date'),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
});

// 業者テーブル
export const contractors = pgTable('contractors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contactPerson: text('contact_person').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  specialties: textArray('specialties').default([]),
  hourlyRate: integer('hourly_rate').default(0),
  rating: integer('rating').default(3),
  isActive: boolean('is_active').default(true),
  lastWorkDate: date('last_work_date'),
  notes: text('notes'),
  isDeleted: boolean('is_deleted').default(false),
  deletedDate: timestamptz('deleted_date'),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
});

// 修繕記録テーブル
export const repairRecords = pgTable('repair_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'set null' }),
  mansionId: uuid('mansion_id').references(() => mansions.id, { onDelete: 'cascade' }),
  contractorId: uuid('contractor_id').references(() => contractors.id, { onDelete: 'set null' }),
  scope: repairScopeEnum('scope').notNull(),
  description: text('description').notNull(),
  requestDate: date('request_date').notNull(),
  startDate: date('start_date'),
  completionDate: date('completion_date'),
  cost: integer('cost').default(0),
  estimatedCost: integer('estimated_cost').default(0),
  contractorName: text('contractor_name').notNull(),
  photoPaths: textArray('photo_paths').default([]),
  reportPdfPath: text('report_pdf_path'),
  status: repairStatusEnum('status').notNull().default('pending'),
  priority: repairPriorityEnum('priority').notNull().default('medium'),
  category: repairCategoryEnum('category').notNull().default('other'),
  notes: text('notes'),
  isDeleted: boolean('is_deleted').default(false),
  deletedDate: timestamptz('deleted_date'),
  createdAt: timestamptz('created_at').defaultNow(),
  updatedAt: timestamptz('updated_at').defaultNow(),
});