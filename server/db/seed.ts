import bcrypt from 'bcryptjs';
import { randomUUID as uuidv4 } from 'crypto';
import { db, createTables } from './index';
import { users, groups, groupSettings, members } from './schema';
import { eq } from 'drizzle-orm';

const now = () => new Date().toISOString();

export async function seed() {
  

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@360';

  const existing = await db.select().from(users).where(eq(users.username, adminUsername));
  if (existing.length > 0) {
    console.log('âœ… Database already seeded');
    return;
  }

  console.log('ðŸš€ Seeding database...');

  // --- ADMIN ---
  const adminId = uuidv4();
  const adminHash = await bcrypt.hash(adminPassword, 12);
  await db.insert(users).values({
    id: adminId,
    username: adminUsername,
    passwordHash: adminHash,
    displayName: process.env.ADMIN_DISPLAY_NAME || 'System Admin',
    role: 'ADMIN',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  });

  // --- HOST ---
  const hostId = uuidv4();
  const hostHash = await bcrypt.hash('Caulong-360', 12);
  await db.insert(users).values({
    id: hostId,
    username: 'hongdung',
    passwordHash: hostHash,
    displayName: 'Nguyá»…n Thá»‹ Há»“ng Dung',
    phone: '0901234567',
    role: 'HOST',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  });

  // --- GROUP ---
  const groupId = uuidv4();
  await db.insert(groups).values({
    id: groupId,
    hostUserId: hostId,
    name: 'NhÃ³m Cáº§u LÃ´ng Há»“ng Dung',
    description: 'NhÃ³m cáº§u lÃ´ng 360',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  });

  // --- SETTINGS ---
  await db.insert(groupSettings).values({
    id: uuidv4(),
    groupId,
    courtFeeFixedPerHour: 130000,
    courtFeeCasualPerHour: 180000,
    shuttleFee: 28000,
    splitMethod: 'BY_MATCHES',
    femaleDiscountPercent: 10,
    defaultCourtsByWeekday: JSON.stringify({ '3': [1, 2, 3] }),
    updatedAt: now(),
  });

  // --- MEMBERS ---
  const roster: Array<[string, 'Cá» Äá»ŠNH' | 'VÃNG LAI', 'MALE' | 'FEMALE', 'Y' | 'TBY' | 'TB' | 'K']> = [
    ['VÃ¢n', 'Cá» Äá»ŠNH', 'FEMALE', 'TB'],
    ['HÃ  Äá»—', 'Cá» Äá»ŠNH', 'FEMALE', 'Y'],
    ['chá»‹ Ba', 'Cá» Äá»ŠNH', 'FEMALE', 'Y'],
    ['Dung', 'Cá» Äá»ŠNH', 'FEMALE', 'TB'],
    ['bÃ© Mi', 'Cá» Äá»ŠNH', 'FEMALE', 'Y'],
    ['TÃ i', 'Cá» Äá»ŠNH', 'MALE', 'TB'],
    ['a PhÆ°á»›c', 'Cá» Äá»ŠNH', 'MALE', 'TB'],
    ['a Bi', 'Cá» Äá»ŠNH', 'MALE', 'TBY'],
    ['Kiá»‡t', 'Cá» Äá»ŠNH', 'MALE', 'TB'],
    ['bÃ© HÃ ', 'VÃNG LAI', 'FEMALE', 'TB'],
    ['bÃ© PhÆ°Æ¡ng', 'VÃNG LAI', 'FEMALE', 'TBY'],
    ['Nhi', 'VÃNG LAI', 'FEMALE', 'TB'],
    ['Doan', 'VÃNG LAI', 'FEMALE', 'Y'],
    ['c Kiá»u', 'VÃNG LAI', 'FEMALE', 'Y'],
    ['TÆ°á»ng', 'VÃNG LAI', 'MALE', 'K'],
    ['a HoÃ ng', 'VÃNG LAI', 'MALE', 'TB'],
    ['PhÆ°Æ¡ng NT', 'VÃNG LAI', 'MALE', 'TB'],
    ['Háº£o', 'VÃNG LAI', 'MALE', 'TBY'],
    ['HuÃ¢n', 'VÃNG LAI', 'MALE', 'TB'],
    ['a Báº£o', 'VÃNG LAI', 'MALE', 'TB'],
    ['Lá»™c', 'VÃNG LAI', 'MALE', 'TBY'],
    ['CÆ°á»ng', 'VÃNG LAI', 'MALE', 'TB'],
    ['Äáº¡t', 'VÃNG LAI', 'MALE', 'TB'],
    ['Hiáº¿u', 'VÃNG LAI', 'MALE', 'TB'],
    ['PhÃºc', 'VÃNG LAI', 'MALE', 'TB'],
    ['Duy', 'VÃNG LAI', 'MALE', 'TBY'],
    ['PhÆ°á»›c nhá»', 'VÃNG LAI', 'MALE', 'TB'],
    ['TrÃ­ Vá»¯ng', 'VÃNG LAI', 'MALE', 'TB'],
    ['Báº£o Duy', 'VÃNG LAI', 'MALE', 'TB'],
    ['TÃ¢n', 'VÃNG LAI', 'MALE', 'TB'],
    ['a TÃ¢m', 'VÃNG LAI', 'MALE', 'TB'],
    ['ThuyÃªn', 'VÃNG LAI', 'MALE', 'K'],
    ['Äá»— HÆ°ng', 'VÃNG LAI', 'MALE', 'TBY'],
    ['Quá»‘c', 'VÃNG LAI', 'MALE', 'TBY'],
  ];

  for (const [name, memberType, gender, skillLevel] of roster) {
    await db.insert(members).values({
      id: uuidv4(),
      groupId,
      name,
      gender,
      skillLevel,
      memberType,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    });
  }

  console.log(`âœ… Created ADMIN: ${adminUsername} / ${adminPassword}`);
  console.log(`âœ… Created HOST: hongdung / Caulong-360`);
  console.log(`âœ… Created group with ${roster.length} members`);
}


