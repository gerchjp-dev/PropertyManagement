import { Mansion, Room, Resident, Contract, RepairRecord, ResidentRequest, FinancialRecord, MonthlyReport, User, Notification } from '../types';
import { Contractor, PaymentRecord } from '../types';

export const mockMansions: Mansion[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'グランドパレス六本木',
    address: '東京都港区麻布十番1-2-3',
    purchaseDate: '2020-03-15',
    photoPaths: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    deedPdfPath: '/documents/deed_park_azabu.pdf',
    totalRooms: 24,
    occupancyRate: 87.5
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'ロイヤルタワー新宿',
    address: '東京都新宿区西新宿2-8-1',
    purchaseDate: '2019-11-20',
    photoPaths: [
      'https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    totalRooms: 36,
    occupancyRate: 94.4
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'プレミアムコート渋谷',
    address: '東京都渋谷区渋谷3-15-7',
    purchaseDate: '2021-01-10',
    photoPaths: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    totalRooms: 18,
    occupancyRate: 83.3
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'エクセレント青山',
    address: '東京都港区南青山4-12-8',
    purchaseDate: '2022-05-20',
    photoPaths: [
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    totalRooms: 28,
    occupancyRate: 92.9
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'ラグジュアリー表参道',
    address: '東京都渋谷区神宮前5-3-15',
    purchaseDate: '2023-02-10',
    photoPaths: [
      'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    totalRooms: 22,
    occupancyRate: 86.4
  }
];

export const mockRooms: Room[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    mansionId: '550e8400-e29b-41d4-a716-446655440000',
    roomNumber: '101',
    layout: '1LDK',
    size: 45.5,
    floor: 1,
    photoPaths: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    conditionNotes: '良好な状態。最近フローリングを張り替えました。',
    isOccupied: true,
    monthlyRent: 70000,
    maintenanceFee: 10000,
    parkingFee: 15000
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    mansionId: '550e8400-e29b-41d4-a716-446655440000',
    roomNumber: '102',
    layout: '2DK',
    size: 52.3,
    floor: 1,
    photoPaths: [
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    conditionNotes: 'キッチンの蛇口要交換。その他良好。',
    isOccupied: false,
    monthlyRent: 75000,
    maintenanceFee: 12000,
    parkingFee: 0
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    mansionId: '550e8400-e29b-41d4-a716-446655440000',
    roomNumber: '206',
    layout: '1LDK',
    size: 48.2,
    floor: 2,
    photoPaths: [],
    conditionNotes: '日当たり良好。バルコニーが広い。',
    isOccupied: true,
    monthlyRent: 72000,
    maintenanceFee: 10000,
    parkingFee: 0
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    mansionId: '550e8400-e29b-41d4-a716-446655440000',
    roomNumber: '503',
    layout: '2LDK',
    size: 65.0,
    floor: 5,
    photoPaths: [],
    conditionNotes: '原状回復工事完了済み。',
    isOccupied: false,
    monthlyRent: 95000,
    maintenanceFee: 15000,
    parkingFee: 0
  }
];

export const mockResidents: Resident[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    roomId: '550e8400-e29b-41d4-a716-446655440010',
    name: '康井 宏益',
    phone: '090-1234-5678',
    email: 'yasui@example.com',
    moveInDate: '2023-04-01',
    emergencyContact: '康井 花子 090-8765-4321',
    userId: 'yasui101',
    password: 'password123',
    isActive: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    roomId: '550e8400-e29b-41d4-a716-446655440012',
    name: '遠里 麻実',
    phone: '080-2345-6789',
    email: 'enri@example.com',
    moveInDate: '2023-09-15',
    emergencyContact: '遠里 健 080-9876-5432',
    userId: 'enri206',
    password: 'password456',
    isActive: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    roomId: '550e8400-e29b-41d4-a716-446655440013',
    name: '土橋 正年',
    phone: '070-3456-7890',
    email: 'dobashi@example.com',
    moveInDate: '2024-01-10',
    emergencyContact: '土橋 美和 070-1234-5678',
    userId: 'dobashi503',
    password: 'password789',
    isActive: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440023',
    roomId: '550e8400-e29b-41d4-a716-446655440011', // 空室の102号室に新規申込
    name: '新井 美咲',
    phone: '080-4567-8901',
    email: 'arai@example.com',
    moveInDate: '2024-12-15',
    emergencyContact: '新井 太郎 080-1111-2222',
    userId: 'arai102',
    password: 'newpass123',
    isActive: true
  }
];

export const mockContracts: Contract[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    residentId: '550e8400-e29b-41d4-a716-446655440020',
    applicationDate: '2023-03-15',
    approvalDate: '2023-03-20',
    signingDate: '2023-03-25',
    moveInDate: '2023-04-01',
    keyHandoverDate: '2023-04-01',
    startDate: '2023-04-01',
    endDate: '2025-03-31',
    rent: 70000,
    maintenanceFee: 10000,
    deposit: 140000,
    keyMoney: 250000,
    guarantor: '康井 次郎',
    contractPdfPath: '/documents/contract_yasui.pdf',
    status: 'active',
    contractSteps: [
      {
        id: '550e8400-e29b-41d4-a716-446655440040',
        stepNumber: 1,
        title: '入居申込受付',
        description: '入居申込書の受付と初期審査',
        status: 'completed',
        category: 'application',
        startDate: '2023-03-15',
        completionDate: '2023-03-15',
        documentPaths: ['/documents/application_yasui.pdf'],
        reportedBy: '管理会社',
        reportedDate: '2023-03-15',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440041',
        stepNumber: 2,
        title: '入居審査',
        description: '収入証明書類の確認と信用調査',
        status: 'completed',
        category: 'screening',
        startDate: '2023-03-16',
        completionDate: '2023-03-19',
        dueDate: '2023-03-20',
        documentPaths: ['/documents/income_proof_yasui.pdf', '/documents/credit_check_yasui.pdf'],
        reportedBy: '管理会社',
        reportedDate: '2023-03-19',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440042',
        stepNumber: 3,
        title: '入居承認',
        description: '審査結果の承認と入居許可',
        status: 'completed',
        category: 'approval',
        startDate: '2023-03-20',
        completionDate: '2023-03-20',
        documentPaths: ['/documents/approval_yasui.pdf'],
        reportedBy: '管理者',
        reportedDate: '2023-03-20',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440043',
        stepNumber: 4,
        title: '契約書作成・締結',
        description: '賃貸借契約書の作成と署名',
        status: 'completed',
        category: 'contract',
        startDate: '2023-03-21',
        completionDate: '2023-03-25',
        documentPaths: ['/documents/contract_yasui.pdf'],
        reportedBy: '管理会社',
        reportedDate: '2023-03-25',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440044',
        stepNumber: 5,
        title: '初期費用支払い',
        description: '敷金・礼金・仲介手数料の支払い確認',
        status: 'completed',
        category: 'payment',
        startDate: '2023-03-26',
        completionDate: '2023-03-30',
        documentPaths: ['/documents/payment_receipt_yasui.pdf'],
        reportedBy: '管理会社',
        reportedDate: '2023-03-30',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440045',
        stepNumber: 6,
        title: '鍵渡し・入居',
        description: '鍵の引き渡しと入居手続き完了',
        status: 'completed',
        category: 'move-in',
        startDate: '2023-04-01',
        completionDate: '2023-04-01',
        documentPaths: ['/documents/key_handover_yasui.pdf'],
        reportedBy: '管理会社',
        reportedDate: '2023-04-01',
        isRequired: true
      }
    ],
    notes: '順調に契約手続きが完了。特に問題なし。'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    residentId: '550e8400-e29b-41d4-a716-446655440021',
    applicationDate: '2023-09-01',
    approvalDate: '2023-09-05',
    signingDate: '2023-09-10',
    moveInDate: '2023-09-15',
    keyHandoverDate: '2023-09-15',
    startDate: '2023-09-15',
    endDate: '2025-09-14',
    rent: 72000,
    maintenanceFee: 10000,
    deposit: 144000,
    keyMoney: 216000,
    guarantor: '遠里 健',
    contractPdfPath: '/documents/contract_enri.pdf',
    status: 'renewal-due',
    renewalDate: '2025-05-25',
    renewalFee: 36000,
    contractSteps: [
      {
        id: '550e8400-e29b-41d4-a716-446655440046',
        stepNumber: 1,
        title: '契約更新通知',
        description: '契約更新の案内と意向確認',
        status: 'completed',
        category: 'application',
        startDate: '2024-12-01',
        completionDate: '2024-12-01',
        dueDate: '2025-03-15',
        documentPaths: ['/documents/renewal_notice_enri.pdf'],
        reportedBy: '管理会社',
        reportedDate: '2024-12-01',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440047',
        stepNumber: 2,
        title: '更新意向確認',
        description: '入居者からの更新意向書受領',
        status: 'in-progress',
        category: 'application',
        startDate: '2024-12-05',
        dueDate: '2025-01-15',
        documentPaths: [],
        assignedTo: '管理会社',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440048',
        stepNumber: 3,
        title: '更新契約書作成',
        description: '契約更新書類の作成',
        status: 'pending',
        category: 'contract',
        dueDate: '2025-02-15',
        documentPaths: [],
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440049',
        stepNumber: 4,
        title: '更新料支払い',
        description: '契約更新料の支払い確認',
        status: 'pending',
        category: 'payment',
        dueDate: '2025-03-15',
        documentPaths: [],
        isRequired: true
      }
    ],
    notes: '契約更新手続き中。期限に注意が必要。'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    residentId: '550e8400-e29b-41d4-a716-446655440023', // 新井美咲の契約
    applicationDate: '2024-12-01',
    startDate: '2024-12-15',
    endDate: '2026-12-14',
    rent: 75000,
    maintenanceFee: 12000,
    deposit: 150000,
    keyMoney: 225000,
    guarantor: '新井 太郎',
    status: 'pending',
    contractSteps: [
      {
        id: '550e8400-e29b-41d4-a716-446655440050',
        stepNumber: 1,
        title: '入居申込受付',
        description: '入居申込書の受付と初期審査',
        status: 'completed',
        category: 'application',
        startDate: '2024-12-01',
        completionDate: '2024-12-01',
        documentPaths: ['/documents/application_arai.pdf'],
        reportedBy: '管理会社',
        reportedDate: '2024-12-01',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440051',
        stepNumber: 2,
        title: '入居審査',
        description: '収入証明書類の確認と信用調査',
        status: 'in-progress',
        category: 'screening',
        startDate: '2024-12-02',
        dueDate: '2024-12-10',
        documentPaths: ['/documents/income_proof_arai.pdf'],
        assignedTo: '管理会社',
        reportedBy: '管理会社',
        reportedDate: '2024-12-02',
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440052',
        stepNumber: 3,
        title: '入居承認',
        description: '審査結果の承認と入居許可',
        status: 'pending',
        category: 'approval',
        dueDate: '2024-12-12',
        documentPaths: [],
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440053',
        stepNumber: 4,
        title: '契約書作成・締結',
        description: '賃貸借契約書の作成と署名',
        status: 'pending',
        category: 'contract',
        dueDate: '2024-12-14',
        documentPaths: [],
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440054',
        stepNumber: 5,
        title: '初期費用支払い',
        description: '敷金・礼金・仲介手数料の支払い確認',
        status: 'pending',
        category: 'payment',
        dueDate: '2024-12-14',
        documentPaths: [],
        isRequired: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440055',
        stepNumber: 6,
        title: '鍵渡し・入居',
        description: '鍵の引き渡しと入居手続き完了',
        status: 'pending',
        category: 'move-in',
        dueDate: '2024-12-15',
        documentPaths: [],
        isRequired: true
      }
    ],
    notes: '新規申込。審査中のため契約手続きを進行中。'
  }
];

export const mockRepairRecords: RepairRecord[] = [
  {
    id: '408867399-9670-489g-5567-6556787380400',
    roomId: 'd3hhef66-6f3c-7hi1-ee9g-9ee0eg613d44',
    mansionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    scope: 'room',
    description: 'キッチンの蛇口交換',
    requestDate: '2024-01-10',
    startDate: '2024-01-15',
    completionDate: '2024-01-15',
    cost: 15000,
    estimatedCost: 12000,
    contractor: '株式会社水道工事',
    contractorId: '519978488-8781-590h-6678-7667898491511',
    photoPaths: [
      'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    reportPdfPath: '/documents/repair_report_001.pdf',
    status: 'completed',
    priority: 'medium',
    category: 'plumbing',
    progressSteps: [
      {
        id: '620089577-7892-601i-7789-8778909502622',
        stepNumber: 1,
        title: '現地調査',
        description: '蛇口の状態確認と交換部品の選定',
        status: 'completed',
        startDate: '2024-01-10',
        completionDate: '2024-01-10',
        photoPaths: ['https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800'],
        reportedBy: '田中修理工',
        reportedDate: '2024-01-10'
      },
      {
        id: '731190666-6903-712j-8890-9889010613733',
        stepNumber: 2,
        title: '部品調達',
        description: '交換用蛇口の調達完了',
        status: 'completed',
        startDate: '2024-01-12',
        completionDate: '2024-01-14',
        photoPaths: [],
        reportedBy: '田中修理工',
        reportedDate: '2024-01-14'
      },
      {
        id: '842201755-5014-823k-9901-0990121724844',
        stepNumber: 3,
        title: '交換作業',
        description: '古い蛇口の撤去と新しい蛇口の取り付け',
        status: 'completed',
        startDate: '2024-01-15',
        completionDate: '2024-01-15',
        photoPaths: ['https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800'],
        reportedBy: '田中修理工',
        reportedDate: '2024-01-15'
      }
    ]
  },
  {
    id: '953312844-4125-934l-0012-1001232835955',
    roomId: 'f5jjgh44-4h5e-9jk3-gg1i-1gg2gi835f66',
    mansionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    scope: 'room',
    description: 'トイレ漏水修繕工事',
    requestDate: '2024-02-15',
    startDate: '2024-02-20',
    completionDate: '2024-02-20',
    cost: 37400,
    estimatedCost: 35000,
    contractor: '水道修理プロ',
    contractorId: '064423933-3236-045m-1123-2112343946066',
    photoPaths: [],
    status: 'completed',
    priority: 'high',
    category: 'plumbing',
    progressSteps: []
  },
  {
    id: '175534022-2347-156n-2234-3223454057177',
    roomId: 'g6kkhi33-3i6f-0kl4-hh2j-2hh3hj946g77',
    mansionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    scope: 'room',
    description: '原状回復工事',
    requestDate: '2024-03-01',
    startDate: '2024-03-10',
    completionDate: '2024-03-25',
    cost: 3080000,
    estimatedCost: 3000000,
    contractor: 'リフォーム株式会社',
    contractorId: '286645111-1458-267o-3345-4334565168288',
    photoPaths: [],
    status: 'completed',
    priority: 'medium',
    category: 'interior',
    progressSteps: []
  },
  {
    id: '397756200-0569-378p-4456-5445676279399',
    mansionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    scope: 'building',
    description: 'エントランス照明LED化工事',
    requestDate: '2024-12-01',
    startDate: '2024-12-15',
    cost: 0,
    estimatedCost: 180000,
    contractor: '電気工事サービス',
    contractorId: '408867399-9670-489q-5567-6556787380400',
    photoPaths: [],
    status: 'in-progress',
    priority: 'medium',
    category: 'electrical',
    progressSteps: [
      {
        id: '519978488-8781-590r-6678-7667898491511',
        stepNumber: 1,
        title: '現地調査・見積',
        description: 'エントランス照明の現状確認とLED化の見積作成',
        status: 'completed',
        startDate: '2024-12-01',
        completionDate: '2024-12-05',
        photoPaths: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'],
        reportedBy: '高橋一郎',
        reportedDate: '2024-12-05'
      },
      {
        id: '620089577-7892-601s-7789-8778909502622',
        stepNumber: 2,
        title: 'LED照明調達',
        description: 'エントランス用LED照明器具の調達',
        status: 'completed',
        startDate: '2024-12-06',
        completionDate: '2024-12-12',
        photoPaths: [],
        reportedBy: '高橋一郎',
        reportedDate: '2024-12-12'
      },
      {
        id: '731190666-6903-712t-8890-9889010613733',
        stepNumber: 3,
        title: '配線工事',
        description: 'LED照明用の配線工事',
        status: 'in-progress',
        startDate: '2024-12-15',
        photoPaths: [],
        reportedBy: '高橋一郎',
        reportedDate: '2024-12-15'
      },
      {
        id: '842201755-5014-823u-9901-0990121724844',
        stepNumber: 4,
        title: '照明器具取り付け',
        description: 'LED照明器具の取り付けと動作確認',
        status: 'pending',
        photoPaths: []
      }
    ],
    notes: '住民からの要望により実施。省エネ効果も期待。'
  }
];

export const mockResidentRequests: ResidentRequest[] = [
  {
    id: '953312844-4125-934v-0012-1001232835955',
    residentId: 'h7llij22-2j7g-1lm5-ii3k-3ii4ik057h88',
    roomId: 'd3hhef66-6f3c-7hi1-ee9g-9ee0eg613d44',
    type: 'repair',
    title: 'エアコンの効きが悪い',
    description: 'リビングのエアコンの冷房効果が弱くなっています。フィルター清掃をしましたが改善されません。',
    photoPaths: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'in-progress',
    priority: 'medium',
    submittedDate: '2024-12-01',
    assignedTo: '田中修理工'
  },
  {
    id: '064423933-3236-045w-1123-2112343946066',
    residentId: 'i8mmjk11-1k8h-2mn6-jj4l-4jj5jl168i99',
    roomId: 'f5jjgh44-4h5e-9jk3-gg1i-1gg2gi835f66',
    type: 'complaint',
    title: '上階からの騒音について',
    description: '深夜に上階から足音や物音が聞こえ、睡眠に支障をきたしています。',
    photoPaths: [],
    status: 'reviewing',
    priority: 'high',
    submittedDate: '2024-12-03'
  },
  {
    id: '175534022-2347-156x-2234-3223454057177',
    residentId: 'h7llij22-2j7g-1lm5-ii3k-3ii4ik057h88',
    roomId: 'd3hhef66-6f3c-7hi1-ee9g-9ee0eg613d44',
    type: 'suggestion',
    title: 'エントランスの照明改善',
    description: 'エントランスの照明が暗く、夜間の安全性に不安があります。LED照明への交換を検討していただけませんか。',
    photoPaths: [],
    status: 'submitted',
    priority: 'low',
    submittedDate: '2024-12-05'
  }
];

export const mockFinancialRecords: FinancialRecord[] = [
  {
    id: '286645111-1458-267y-3345-4334565168288',
    date: '2024-03-01',
    type: 'income',
    category: '賃料',
    amount: 70000,
    description: '101号室 3月分賃料',
    roomId: 'd3hhef66-6f3c-7hi1-ee9g-9ee0eg613d44',
    residentId: 'h7llij22-2j7g-1lm5-ii3k-3ii4ik057h88',
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: '397756200-0569-378z-4456-5445676279399',
    date: '2024-03-01',
    type: 'income',
    category: '共益費',
    amount: 10000,
    description: '101号室 3月分共益費',
    roomId: 'd3hhef66-6f3c-7hi1-ee9g-9ee0eg613d44',
    residentId: 'h7llij22-2j7g-1lm5-ii3k-3ii4ik057h88',
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: '408867399-9670-4890-5567-6556787380400',
    date: '2024-03-15',
    type: 'income',
    category: '敷金',
    amount: 416975,
    description: '3月分敷金収入',
    isRecurring: false
  },
  {
    id: '519978488-8781-5901-6678-7667898491511',
    date: '2024-03-20',
    type: 'income',
    category: '礼金',
    amount: 250000,
    description: '101号室 礼金',
    roomId: 'd3hhef66-6f3c-7hi1-ee9g-9ee0eg613d44',
    isRecurring: false
  },
  {
    id: '620089577-7892-6012-7789-8778909502622',
    date: '2024-03-01',
    type: 'expense',
    category: '管理費',
    amount: 115878,
    description: '3月分管理報酬',
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: '731190666-6903-7123-8890-9889010613733',
    date: '2024-03-05',
    type: 'expense',
    category: '修繕費',
    subcategory: '個別修繕',
    amount: 37400,
    description: '602号室トイレ漏水修繕工事',
    roomId: 'f5jjgh44-4h5e-9jk3-gg1i-1gg2gi835f66',
    isRecurring: false
  },
  {
    id: '842201755-5014-8234-9901-0990121724844',
    date: '2024-03-10',
    type: 'expense',
    category: '修繕費',
    subcategory: '原状回復',
    amount: 3080000,
    description: '503号室原状回復工事',
    roomId: 'g6kkhi33-3i6f-0kl4-hh2j-2hh3hj946g77',
    isRecurring: false
  },
  {
    id: '953312844-4125-9345-0012-1001232835955',
    date: '2024-03-15',
    type: 'expense',
    category: '修繕費',
    subcategory: '共用部',
    amount: 231000,
    description: 'フェンス補修工事',
    isRecurring: false
  }
];

// 物件別月次支出データ
export const mockMansionExpenses = [
  // グランドパレス六本木の支出
  {
    id: 'exp_001',
    mansionId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    mansionName: 'グランドパレス六本木',
    year: 2024,
    month: 12,
    expenses: {
      management: 85000,
      utilities: 45000,
      maintenance: 32000,
      repairs: 150000,
      insurance: 25000,
      cleaning: 18000,
      security: 22000,
      other: 8000
    },
    totalExpense: 385000,
    uploadedFiles: [
      { name: '管理費請求書_12月.pdf', type: 'management', uploadDate: '2024-12-01' },
      { name: '電気代請求書_12月.pdf', type: 'utilities', uploadDate: '2024-12-05' },
      { name: '修繕費見積書.pdf', type: 'repairs', uploadDate: '2024-12-10' }
    ]
  },
  // ロイヤルタワー新宿の支出
  {
    id: 'exp_002',
    mansionId: 'b1ffcd88-8d1a-5fg9-cc7e-7cc8ce491b22',
    mansionName: 'ロイヤルタワー新宿',
    year: 2024,
    month: 12,
    expenses: {
      management: 120000,
      utilities: 68000,
      maintenance: 45000,
      repairs: 89000,
      insurance: 35000,
      cleaning: 28000,
      security: 30000,
      other: 12000
    },
    totalExpense: 427000,
    uploadedFiles: [
      { name: '管理費請求書_12月.pdf', type: 'management', uploadDate: '2024-12-01' },
      { name: 'ガス代請求書_12月.pdf', type: 'utilities', uploadDate: '2024-12-03' }
    ]
  },
  // プレミアムコート渋谷の支出
  {
    id: 'exp_003',
    mansionId: 'c2ggde77-7e2b-6gh0-dd8f-8dd9df502c33',
    mansionName: 'プレミアムコート渋谷',
    year: 2024,
    month: 12,
    expenses: {
      management: 65000,
      utilities: 38000,
      maintenance: 25000,
      repairs: 45000,
      insurance: 18000,
      cleaning: 15000,
      security: 12000,
      other: 5000
    },
    totalExpense: 223000,
    uploadedFiles: [
      { name: '管理費請求書_12月.pdf', type: 'management', uploadDate: '2024-12-01' }
    ]
  },
  // エクセレント青山の支出
  {
    id: 'exp_004',
    mansionId: 'd3hhef66-6f3c-7hi1-ee9g-9ee0eg613d44',
    mansionName: 'エクセレント青山',
    year: 2024,
    month: 12,
    expenses: {
      management: 95000,
      utilities: 52000,
      maintenance: 38000,
      repairs: 125000,
      insurance: 28000,
      cleaning: 22000,
      security: 25000,
      other: 10000
    },
    totalExpense: 395000,
    uploadedFiles: [
      { name: '管理費請求書_12月.pdf', type: 'management', uploadDate: '2024-12-01' },
      { name: '修繕費領収書_12月.pdf', type: 'repairs', uploadDate: '2024-12-15' }
    ]
  },
  // ラグジュアリー表参道の支出
  {
    id: 'exp_005',
    mansionId: 'e4iifg55-5g4d-8ij2-ff0h-0ff1fh724e55',
    mansionName: 'ラグジュアリー表参道',
    year: 2024,
    month: 12,
    expenses: {
      management: 78000,
      utilities: 42000,
      maintenance: 30000,
      repairs: 67000,
      insurance: 22000,
      cleaning: 18000,
      security: 20000,
      other: 7000
    },
    totalExpense: 284000,
    uploadedFiles: [
      { name: '管理費請求書_12月.pdf', type: 'management', uploadDate: '2024-12-01' },
      { name: '清掃費請求書_12月.pdf', type: 'cleaning', uploadDate: '2024-12-08' }
    ]
  }
];

export const mockMonthlyReports: MonthlyReport[] = [
  {
    id: '064423933-3236-0456-1123-2112343946066',
    year: 2024,
    month: 3,
    totalIncome: 3500000,
    totalExpense: 381549,
    netIncome: 3118451,
    occupancyRate: 87.5,
    incomeBreakdown: {
      rent: 2800000,
      maintenanceFee: 400000,
      deposit: 416975,
      keyMoney: 250000,
      parking: 180000,
      other: 53025
    },
    expenseBreakdown: {
      management: 115878,
      maintenance: 45000,
      utilities: 32000,
      repairs: 3348400,
      insurance: 15000,
      taxes: 25000,
      other: 8271
    },
    reportPdfPath: '/reports/monthly_2024_03.pdf'
  },
  {
    id: '175534022-2347-1567-2234-3223454057177',
    year: 2024,
    month: 4,
    totalIncome: 3200000,
    totalExpense: 255942,
    netIncome: 2944058,
    occupancyRate: 91.7,
    incomeBreakdown: {
      rent: 2650000,
      maintenanceFee: 380000,
      deposit: 834168,
      keyMoney: 0,
      parking: 165000,
      other: 70832
    },
    expenseBreakdown: {
      management: 115878,
      maintenance: 42000,
      utilities: 28000,
      repairs: 45000,
      insurance: 15000,
      taxes: 0,
      other: 10064
    }
  }
];

export const mockUsers: User[] = [
  {
    id: '286645111-1458-2678-3345-4334565168288',
    username: 'admin',
    email: 'admin@lcmanagement.com',
    role: 'admin',
    permissions: ['all'],
    isActive: true,
    lastLogin: '2024-12-10T09:00:00Z'
  },
  {
    id: '397756200-0569-3789-4456-5445676279399',
    username: 'manager',
    email: 'manager@lcmanagement.com',
    role: 'manager',
    permissions: ['read', 'write', 'manage_residents', 'manage_repairs'],
    isActive: true,
    lastLogin: '2024-12-09T14:30:00Z'
  },
  {
    id: '408867399-9670-4890-5567-6556787380400',
    username: 'yasui101',
    email: 'yasui@example.com',
    role: 'resident',
    permissions: ['read_own', 'submit_requests'],
    isActive: true,
    lastLogin: '2024-12-08T18:45:00Z'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '519978488-8781-5901-6678-7667898491511',
    userId: '286645111-1458-2678-3345-4334565168288',
    type: 'contract-renewal',
    title: '契約更新期限接近',
    message: '遠里 麻実様（206号室）の契約が2025年5月25日に更新期限を迎えます。',
    isRead: false,
    createdDate: '2024-12-10T10:00:00Z',
    actionUrl: '/contracts'
  },
  {
    id: '620089577-7892-6012-7789-8778909502622',
    userId: '286645111-1458-2678-3345-4334565168288',
    type: 'repair-request',
    title: '新しい修繕依頼',
    message: '康井 宏益様（101号室）からエアコンの修繕依頼が提出されました。',
    isRead: false,
    createdDate: '2024-12-01T15:30:00Z',
    actionUrl: '/resident-requests'
  },
  {
    id: '731190666-6903-7123-8890-9889010613733',
    userId: '408867399-9670-4890-5567-6556787380400',
    type: 'general',
    title: '修繕作業開始のお知らせ',
    message: 'エアコンの修繕作業を開始いたします。作業員が訪問予定です。',
    isRead: true,
    createdDate: '2024-12-02T09:00:00Z'
  }
];

export const mockContractors: Contractor[] = [
  {
    id: '519978488-8781-590h-6678-7667898491511',
    name: '株式会社水道工事',
    contactPerson: '田中 修理工',
    phone: '03-1234-5678',
    email: 'tanaka@suidou-kouji.co.jp',
    address: '東京都港区赤坂1-2-3',
    specialties: ['plumbing'],
    hourlyRate: 8000,
    rating: 4,
    isActive: true,
    lastWorkDate: '2024-01-15',
    notes: 'キッチン蛇口交換で利用。対応が迅速で丁寧。'
  },
  {
    id: '064423933-3236-045m-1123-2112343946066',
    name: '水道修理プロ',
    contactPerson: '佐藤 太郎',
    phone: '03-2345-6789',
    email: 'sato@suidou-pro.com',
    address: '東京都新宿区西新宿2-1-1',
    specialties: ['plumbing'],
    hourlyRate: 7500,
    rating: 5,
    isActive: true,
    lastWorkDate: '2024-02-20',
    notes: 'トイレ漏水修繕で利用。技術力が高く、料金も適正。'
  },
  {
    id: '286645111-1458-267o-3345-4334565168288',
    name: 'リフォーム株式会社',
    contactPerson: '鈴木 花子',
    phone: '03-3456-7890',
    email: 'suzuki@reform-corp.co.jp',
    address: '東京都渋谷区渋谷3-4-5',
    specialties: ['interior', 'exterior'],
    hourlyRate: 12000,
    rating: 4,
    isActive: true,
    lastWorkDate: '2024-03-10',
    notes: '原状回復工事で利用。大規模工事も対応可能。'
  },
  {
    id: '408867399-9670-489q-5567-6556787380400',
    name: '電気工事サービス',
    contactPerson: '高橋 一郎',
    phone: '03-4567-8901',
    email: 'takahashi@denki-service.com',
    address: '東京都品川区大崎1-2-3',
    specialties: ['electrical'],
    hourlyRate: 9000,
    rating: 4,
    isActive: true,
    notes: '電気設備の点検・修理に対応。'
  },
  {
    id: '842201755-5014-823a-9901-0990121724844',
    name: 'クリーンサービス東京',
    contactPerson: '山田 美咲',
    phone: '03-5678-9012',
    email: 'yamada@clean-tokyo.co.jp',
    address: '東京都中央区銀座5-6-7',
    specialties: ['cleaning'],
    hourlyRate: 3500,
    rating: 5,
    isActive: true,
    notes: '定期清掃で利用。作業が丁寧で信頼できる。'
  }
];

export const mockPaymentRecords: PaymentRecord[] = [
  {
    id: '953312844-4125-934b-0012-1001232835955',
    payeeName: '株式会社水道工事',
    amount: 15000,
    description: 'キッチン蛇口交換作業',
    paymentDate: '2024-12-15',
    dueDate: '2024-12-20',
    category: 'contractor',
    paymentMethod: 'bank_transfer',
    status: 'completed',
    bankAccount: {
      bankName: 'みずほ銀行',
      branchName: '赤坂支店',
      accountType: 'checking',
      accountNumber: '1234567',
      accountName: '株式会社水道工事'
    },
    invoiceNumber: 'INV-2024-001',
    receiptPath: '/receipts/receipt_001.pdf'
  },
  {
    id: '064423933-3236-045c-1123-2112343946066',
    payeeName: '水道修理プロ',
    amount: 37400,
    description: 'トイレ漏水修繕工事',
    paymentDate: '2024-12-20',
    dueDate: '2024-12-25',
    category: 'contractor',
    paymentMethod: 'bank_transfer',
    status: 'pending',
    bankAccount: {
      bankName: '三菱UFJ銀行',
      branchName: '新宿支店',
      accountType: 'checking',
      accountNumber: '2345678',
      accountName: '水道修理プロ'
    },
    invoiceNumber: 'INV-2024-002'
  },
  {
    id: '175534022-2347-156d-2234-3223454057177',
    payeeName: 'リフォーム株式会社',
    amount: 3080000,
    description: '503号室原状回復工事',
    paymentDate: '2024-12-10',
    dueDate: '2024-12-15',
    category: 'contractor',
    paymentMethod: 'bank_transfer',
    status: 'completed',
    bankAccount: {
      bankName: '三井住友銀行',
      branchName: '渋谷支店',
      accountType: 'checking',
      accountNumber: '3456789',
      accountName: 'リフォーム株式会社'
    },
    invoiceNumber: 'INV-2024-003',
    receiptPath: '/receipts/receipt_003.pdf'
  },
  {
    id: '286645111-1458-267e-3345-4334565168288',
    payeeName: '東京電力エナジーパートナー',
    amount: 45000,
    description: '12月分電気代',
    paymentDate: '2024-12-25',
    dueDate: '2024-12-30',
    category: 'utility',
    paymentMethod: 'bank_transfer',
    status: 'pending',
    bankAccount: {
      bankName: 'みずほ銀行',
      branchName: '東京営業部',
      accountType: 'checking',
      accountNumber: '4567890',
      accountName: '東京電力エナジーパートナー株式会社'
    }
  },
  {
    id: '397756200-0569-378f-4456-5445676279399',
    payeeName: 'クリーンサービス東京',
    amount: 28000,
    description: '12月分定期清掃',
    paymentDate: '2024-12-30',
    dueDate: '2025-01-05',
    category: 'maintenance',
    paymentMethod: 'bank_transfer',
    status: 'pending',
    bankAccount: {
      bankName: '三菱UFJ銀行',
      branchName: '銀座支店',
      accountType: 'checking',
      accountNumber: '5678901',
      accountName: 'クリーンサービス東京株式会社'
    }
  }
];