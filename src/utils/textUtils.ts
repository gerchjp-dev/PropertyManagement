// テキスト変換ユーティリティ関数

/**
 * 全角文字を半角文字に変換する
 * @param str 変換対象の文字列
 * @returns 半角に変換された文字列
 */
export const convertFullWidthToHalfWidth = (str: string): string => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });
};

/**
 * 部屋番号を正規化する（全角→半角、前後の空白削除）
 * @param roomNumber 部屋番号
 * @returns 正規化された部屋番号
 */
export const normalizeRoomNumber = (roomNumber: string): string => {
  return convertFullWidthToHalfWidth(roomNumber.trim());
};

/**
 * 数字のみを抽出して半角に変換
 * @param str 変換対象の文字列
 * @returns 半角数字のみの文字列
 */
export const extractAndConvertNumbers = (str: string): string => {
  // 全角数字を半角に変換
  const halfWidth = convertFullWidthToHalfWidth(str);
  // 数字のみを抽出
  return halfWidth.replace(/[^0-9]/g, '');
};

/**
 * 部屋番号のフォーマット（3桁ゼロパディング）
 * @param roomNumber 部屋番号
 * @returns フォーマットされた部屋番号（例: "001", "102"）
 */
export const formatRoomNumber = (roomNumber: string): string => {
  const normalized = normalizeRoomNumber(roomNumber);
  const numbersOnly = extractAndConvertNumbers(normalized);
  
  if (numbersOnly === '') return roomNumber; // 数字がない場合はそのまま返す
  
  // 3桁にゼロパディング
  return numbersOnly.padStart(3, '0');
};