/*
  物件管理システム - サンプル画像データ
  
  このファイルには画像パスのサンプルデータが含まれます：
  - 物件写真
  - 部屋写真
  - 修繕記録写真
  - 住民要望写真
  
  注意: 実際の画像ファイルは Supabase Storage または外部ストレージに保存する必要があります。
  ここでは、サンプルとしてプレースホルダーのパスを設定します。
*/

-- =============================================================================
-- 1. 物件写真の追加
-- =============================================================================

-- グランドパレス六本木
UPDATE mansions SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- ロイヤルタワー新宿
UPDATE mansions SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
  'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- プレミアムコート渋谷
UPDATE mansions SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800',
  'https://images.unsplash.com/photo-1567684014761-b65e2e5e8e92?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- エクセレント青山
UPDATE mansions SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
  'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

-- ラグジュアリー表参道
UPDATE mansions SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440004';

-- =============================================================================
-- 2. 部屋写真の追加
-- =============================================================================

-- グランドパレス六本木 101号室（1LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1502672260066-6bc358903dfa?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440010';

-- グランドパレス六本木 102号室（2DK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440011';

-- グランドパレス六本木 206号室（1LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440012';

-- グランドパレス六本木 305号室（2LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800',
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440013';

-- グランドパレス六本木 402号室（3LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440014';

-- グランドパレス六本木 503号室（2LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440015';

-- ロイヤルタワー新宿 801号室（1K）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800',
  'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440020';

-- ロイヤルタワー新宿 1205号室（1LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1560449752-c37b5d5d6851?w=800',
  'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440021';

-- ロイヤルタワー新宿 1508号室（2LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=800',
  'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440022';

-- ロイヤルタワー新宿 2002号室（3LDK）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=800',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440023';

-- ロイヤルタワー新宿 2510号室（Penthouse）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  'https://images.unsplash.com/photo-1600566753051-f0b8f838e2d4?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440024';

-- プレミアムコート渋谷（5部屋）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440030';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440031';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800',
  'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440032';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
  'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440033';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440034';

-- エクセレント青山（5部屋）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440040';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440041';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1560449752-c37b5d5d6851?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440042';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440043';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600566753051-f0b8f838e2d4?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440044';

-- ラグジュアリー表参道（4部屋）
UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440050';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800',
  'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800',
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440051';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440052';

UPDATE rooms SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  'https://images.unsplash.com/photo-1600566753051-f0b8f838e2d4?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440053';

-- =============================================================================
-- 3. 修繕記録写真の追加
-- =============================================================================

-- キッチン水道蛇口交換（完了）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440120';

-- 照明器具交換（完了）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440121';

-- 外壁塗装補修（完了）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440122';

-- エアコンクリーニング（完了）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1631545804570-7f9ca92c813c?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440123';

-- フローリング補修（完了）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440124';

-- トイレ水漏れ修理（完了）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440126';

-- 壁紙張替え（完了）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',
  'https://images.unsplash.com/photo-1604762515479-6ad563edb021?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440127';

-- キッチン改装（進行中）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440130';

-- 屋上防水工事（進行中）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440131';

-- 給湯器交換（進行中）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440132';

-- 浴室リフォーム（進行中）
UPDATE repair_records SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440133';

-- =============================================================================
-- 4. 住民要望写真の追加
-- =============================================================================

-- キッチンの蛇口から水漏れ（解決済み）
UPDATE resident_requests SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440260';

-- リビングの照明が点灯しない（解決済み）
UPDATE resident_requests SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440261';

-- トイレの水が流れにくい（解決済み）
UPDATE resident_requests SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1623014064323-c878b8840c7d?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440262';

-- キッチンが古くなってきた（進行中）
UPDATE resident_requests SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440263';

-- ブレーカーが頻繁に落ちる（進行中）
UPDATE resident_requests SET photo_paths = ARRAY[
  'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'
]
WHERE id = '550e8400-e29b-41d4-a716-446655440264';

-- =============================================================================
-- サンプル画像データ追加完了
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ サンプル画像データの追加が完了しました！';
    RAISE NOTICE '🏢 物件写真: 5物件に追加';
    RAISE NOTICE '🏠 部屋写真: 25部屋に追加';
    RAISE NOTICE '🔧 修繕記録写真: 11件に追加';
    RAISE NOTICE '📮 住民要望写真: 5件に追加';
    RAISE NOTICE '📸 すべての画像はUnsplashのサンプル画像を使用';
    RAISE NOTICE '💡 本番環境では Supabase Storage または外部ストレージに画像をアップロードしてください';
END $$;
