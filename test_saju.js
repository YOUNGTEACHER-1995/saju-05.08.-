const { Solar, Lunar } = require('lunar-javascript');

function getSaju(year, month, day, hour, minute, isLunar) {
  let lunar;
  if (!isLunar) {
    const solar = Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
    lunar = solar.getLunar();
  } else {
    lunar = Lunar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
  }
  
  const baZi = lunar.getEightChar();
  // If time is unknown (hour is null), we don't output the time pillar
  const yearGanZhi = baZi.getYear();
  const monthGanZhi = baZi.getMonth();
  const dayGanZhi = baZi.getDay();
  const timeGanZhi = (hour !== null && hour !== undefined) ? baZi.getTime() : "모름";

  return `${yearGanZhi}년 ${monthGanZhi}월 ${dayGanZhi}일 ${timeGanZhi}시`;
}

console.log("Solar:", getSaju(2024, 5, 8, 14, 30, false));
console.log("Lunar:", getSaju(2024, 4, 1, 14, 30, true));
console.log("Unknown Time:", getSaju(2024, 5, 8, null, null, false));
