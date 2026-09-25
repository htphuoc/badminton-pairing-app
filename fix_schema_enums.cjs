const fs = require('fs');

let c = fs.readFileSync('server/db/schema.ts', 'utf8');

c = c.replace(/role: text\('role', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}/g, "role: text('role', { enum: ['ADMIN', 'HOST', 'MEMBER'] }");
c = c.replace(/gender: text\('gender', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}/g, "gender: text('gender', { enum: ['MALE', 'FEMALE'] }");
c = c.replace(/skillLevel: text\('skill_level', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}/g, "skillLevel: text('skill_level', { enum: ['Y', 'TBY', 'TB', 'K'] }");
c = c.replace(/splitMethod: text\('split_method', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}/g, "splitMethod: text('split_method', { enum: ['EQUAL', 'BY_MATCHES'] }");
c = c.replace(/status: text\('status', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}\)\.notNull\(\)\.default\('PLANNED'\)/g, "status: text('status', { enum: ['PLANNED', 'RUNNING', 'FINISHED'] }).notNull().default('PLANNED')");
c = c.replace(/attendance: text\('attendance', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}/g, "attendance: text('attendance', { enum: ['ABSENT', 'WAITING', 'PLAYING', 'RESTING', 'FINISHED'] }");
c = c.replace(/matchType: text\('match_type', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}/g, "matchType: text('match_type', { enum: ['ĐÔI NAM', 'ĐÔI NỮ', 'ĐÔI NAM NỮ', 'TỰ DO'] }");
c = c.replace(/status: text\('status', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}\)\.notNull\(\)\.default\('PLAYING'\)/g, "status: text('status', { enum: ['DRAFT', 'PLAYING', 'COMPLETED', 'CANCELLED'] }).notNull().default('PLAYING')");
c = c.replace(/assignmentMode: text\('assignment_mode', \{ enum: \['CỐ ĐỊNH', 'VÃNG LAI'\] \}/g, "assignmentMode: text('assignment_mode', { enum: ['AUTO', 'MANUAL'] }");

fs.writeFileSync('server/db/schema.ts', c, 'utf8');
console.log('Fixed schema enums correctly');
