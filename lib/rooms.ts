/**
 * Building and room data for campus
 */

export type Building = "ITACA" | "PADIGLIONE C" | "PADIGLIONE D";

export const buildings: Building[] = ["ITACA", "PADIGLIONE C", "PADIGLIONE D"];

export const rooms: Record<Building, string[]> = {
  "ITACA": [
    "11", "12", "13", "14",
    "101SX", "101DX", "102", "103", "104", "105", "106", "107", "108",
    "201SX", "201DX", "202", "203", "204", "205", "206", "207", "208",
    "301SX", "301DX", "302", "303", "304", "305", "306", "307", "308"
  ],
  "PADIGLIONE C": [
    "101", "102", "103", "104", "105",
    "201", "202", "203", "204",
    "301", "302", "303", "304",
    "401", "402", "403", "404", "405"
  ],
  "PADIGLIONE D": [
    "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012",
    "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123",
    "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224",
    "301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323", "324",
    "401", "402", "403", "404", "405", "406", "407", "408", "409", "410"
  ]
};

export function formatRoomNumber(building: Building, room: string): string {
  return `${building}-${room}`;
}

export function parseRoomNumber(roomNumber: string | null): { building: Building | null; room: string | null } {
  if (!roomNumber) return { building: null, room: null };
  
  for (const building of buildings) {
    if (roomNumber.startsWith(building + "-")) {
      const room = roomNumber.substring(building.length + 1);
      return { building, room };
    }
  }
  
  return { building: null, room: null };
}

