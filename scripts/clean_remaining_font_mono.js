const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');
let content = raw.replace(/\r\n/g, '\n');

// Split at renderAdminPage
let homePageCode = content.substring(0, content.indexOf('function renderAdminPage'));
const restOfCode = content.substring(content.indexOf('function renderAdminPage'));

// Clean concierge lines
homePageCode = homePageCode.replace(
  'Inquiries route to <span class="text-[#2546A6] font-medium">support@propledger.vishalbhutekar.me</span>',
  'Inquiries route directly to our dedicated property operations desk'
);
homePageCode = homePageCode.replace(
  "statusBox.innerHTML = 'Routing to support@propledger.vishalbhutekar.me...';",
  "statusBox.innerHTML = 'Connecting with property concierge desk...';"
);
homePageCode = homePageCode.replace(
  '<span>Send Inquiry to support@propledger.vishalbhutekar.me</span>',
  '<span>Send Inquiry to Concierge Desk</span>'
);

// Clean font-mono in unit cards
homePageCode = homePageCode.replace(/<p class="text-xs text-slate-500 font-mono mt-0.5">/g, '<p class="text-xs text-slate-500 font-medium mt-0.5">');
homePageCode = homePageCode.replace(/<span class="text-lg font-black text-\[#2546A6\] font-mono">/g, '<span class="text-lg font-black text-[#2546A6] tabular-nums">');
homePageCode = homePageCode.replace(/<span class="text-2xl font-black text-emerald-600 font-mono">/g, '<span class="text-2xl font-black text-emerald-600 tabular-nums">');
homePageCode = homePageCode.replace(/<p id="outSavings" class="text-xl font-bold text-\[#38BDF8\] font-mono">/g, '<p id="outSavings" class="text-xl font-bold text-[#38BDF8] tabular-nums">');

// Clean security pillars
homePageCode = homePageCode.replace(/<span class="text-\[10px\] font-mono text-\[#38BDF8\] uppercase font-bold tracking-wider block">/g, '<span class="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider block">');
homePageCode = homePageCode.replace(/<span class="text-\[10px\] font-mono text-\[#60A5FA\] uppercase font-bold tracking-wider block">/g, '<span class="text-[10px] text-[#60A5FA] uppercase font-bold tracking-wider block">');
homePageCode = homePageCode.replace(/<span class="text-\[10px\] font-mono text-\[#2DD4BF\] uppercase font-bold tracking-wider block">/g, '<span class="text-[10px] text-[#2DD4BF] uppercase font-bold tracking-wider block">');
homePageCode = homePageCode.replace(/<span class="text-\[10px\] font-mono text-emerald-400 uppercase font-bold tracking-wider block">/g, '<span class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">');
homePageCode = homePageCode.replace(/<span class="text-xs font-bold text-\[#00A896\] uppercase tracking-wider font-mono">/g, '<span class="text-xs font-bold text-[#00A896] uppercase tracking-wider">');

// Clean stats in security
homePageCode = homePageCode.replace(/<div class="text-3xl sm:text-4xl font-black text-\[#38BDF8\] font-mono">/g, '<div class="text-3xl sm:text-4xl font-black text-[#38BDF8] tabular-nums">');
homePageCode = homePageCode.replace(/<div class="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">/g, '<div class="text-3xl sm:text-4xl font-black text-emerald-400 tabular-nums">');
homePageCode = homePageCode.replace(/<div class="text-3xl sm:text-4xl font-black text-\[#F59E0B\] font-mono">/g, '<div class="text-3xl sm:text-4xl font-black text-[#F59E0B] tabular-nums">');

// Clean payment modal numbers
homePageCode = homePageCode.replace(/<div class="text-\[11px\] text-slate-500 font-mono flex/g, '<div class="text-[11px] text-slate-500 font-medium flex');
homePageCode = homePageCode.replace(/<span class="font-mono font-bold text-slate-800">/g, '<span class="font-bold text-slate-800 tabular-nums">');
homePageCode = homePageCode.replace(/<span class="font-mono">\$3,250\.00<\/span>/g, '<span class="font-bold text-slate-900 tabular-nums">$3,250.00</span>');
homePageCode = homePageCode.replace(/<span class="text-emerald-600 font-mono text-base font-black">/g, '<span class="text-emerald-600 tabular-nums text-base font-black">');

// Clean tour modal subtitle and rent
homePageCode = homePageCode.replace(/<p class="text-xs text-slate-500 font-mono" id="tourModalSubtitle">/g, '<p class="text-xs text-slate-500 font-medium" id="tourModalSubtitle">');
homePageCode = homePageCode.replace(/<p id="tourUnitRent" class="text-xs font-black text-\[#2546A6\] font-mono mt-0\.5">/g, '<p id="tourUnitRent" class="text-xs font-black text-[#2546A6] tabular-nums mt-0.5">');

content = homePageCode + restOfCode;
fs.writeFileSync(targetPath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Remaining font-mono and concierge text cleaned successfully!');
