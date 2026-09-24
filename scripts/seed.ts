import { PrismaClient, VenueTier } from "@prisma/client";
import { resolveTimeBand, creditPrice } from "../lib/pricing";

const prisma = new PrismaClient();

const SPORTS = [
  { sport: "pilates", name: "필라테스 (Pilates)" },
  { sport: "boxing", name: "복싱 (Boxing)" },
  { sport: "yoga", name: "요가 (Yoga)" },
  { sport: "gym", name: "헬스 (Gym)" },
  { sport: "crossfit", name: "크로스핏 (CrossFit)" },
  { sport: "swimming", name: "수영 (Swimming)" },
];

const GYM_DATA = [
  { name: "강남 피트니스", lat: 37.4979, lng: 127.0276, pop: 85 },
  { name: "역삼 요가룸", lat: 37.5007, lng: 127.0365, pop: 72 },
  { name: "선릉 복싱짐", lat: 37.5045, lng: 127.0490, pop: 65 },
  { name: "삼성 필라테스", lat: 37.5088, lng: 127.0630, pop: 78 },
  { name: "논현 크로스핏", lat: 37.5100, lng: 127.0250, pop: 42 },
  { name: "청담 스튜디오", lat: 37.5200, lng: 127.0470, pop: 90 },
  { name: "신논현 헬스클럽", lat: 37.5040, lng: 127.0240, pop: 55 },
  { name: "대치 짐", lat: 37.4940, lng: 127.0580, pop: 30 },
  { name: "도곡 요가", lat: 37.4880, lng: 127.0440, pop: 25 },
  { name: "압구정 필라테스", lat: 37.5250, lng: 127.0280, pop: 88 },
  { name: "학동 복싱", lat: 37.5140, lng: 127.0310, pop: 35 },
  { name: "양재 헬스", lat: 37.4840, lng: 127.0350, pop: 48 },
  { name: "개포 크로스핏", lat: 37.4790, lng: 127.0480, pop: 20 },
  { name: "일원 스튜디오", lat: 37.4830, lng: 127.0820, pop: 28 },
  { name: "수서 짐", lat: 37.4870, lng: 127.1000, pop: 22 },
  { name: "잠실 필라테스", lat: 37.5130, lng: 127.1000, pop: 75 },
  { name: "선정릉 요가", lat: 37.5100, lng: 127.0430, pop: 60 },
  { name: "강남역 헬스", lat: 37.4970, lng: 127.0280, pop: 92 },
  { name: "교대 복싱짐", lat: 37.4930, lng: 127.0140, pop: 50 },
  { name: "매봉 크로스핏", lat: 37.4870, lng: 127.0330, pop: 18 },
  { name: "한티 스튜디오", lat: 37.5010, lng: 127.0530, pop: 32 },
  { name: "뱅뱅 피트니스", lat: 37.5020, lng: 127.0260, pop: 70 },
  { name: "도산 요가룸", lat: 37.5220, lng: 127.0380, pop: 82 },
  { name: "세곡 헬스장", lat: 37.4700, lng: 127.0600, pop: 15 },
];

function pickTier(popularity: number): VenueTier {
  if (popularity >= 70) return VenueTier.PREMIUM;
  if (popularity >= 40) return VenueTier.MID;
  return VenueTier.NEIGHBORHOOD;
}

async function main() {
  const gyms = [];

  for (const g of GYM_DATA) {
    const tier = pickTier(g.pop);
    const allowsPeak = tier === VenueTier.NEIGHBORHOOD || g.pop < 40;

    const gym = await prisma.gym.create({
      data: {
        name: g.name,
        lat: g.lat,
        lng: g.lng,
        tier,
        allowsPeak,
        rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
        popularity: g.pop,
      },
    });
    gyms.push(gym);

    const shuffled = [...SPORTS].sort(() => Math.random() - 0.5);
    const activities = shuffled.slice(0, 3 + Math.floor(Math.random() * 4));
    for (const a of activities) {
      const activity = await prisma.activity.create({
        data: { gymId: gym.id, name: a.name, sport: a.sport, durationMin: 50 },
      });

      for (let day = 0; day < 7; day++) {
        const hours = [8, 12, 18];
        for (const hour of hours) {
          const startTime = new Date();
          startTime.setDate(startTime.getDate() + day);
          startTime.setHours(hour, 0, 0, 0);

          const band = resolveTimeBand(startTime);
          if (band === "PEAK" && !gym.allowsPeak) continue;

          await prisma.classSlot.create({
            data: {
              gymId: gym.id,
              activityId: activity.id,
              startTime,
              timeBand: band,
              capacity: 8,
              booked: 0,
              creditCost: creditPrice(gym.tier, band),
            },
          });
        }
      }
    }
  }

  const demoMember = await prisma.user.create({
    data: { email: "demo.member@ketmon.app", name: "데모 회원", role: "MEMBER", creditBalance: 30 },
  });

  const ownerGyms = gyms.slice(0, 2);
  const demoOwner = await prisma.user.create({
    data: { email: "demo.owner@ketmon.app", name: "데모 오너", role: "OWNER" },
  });
  for (const g of ownerGyms) {
    await prisma.gym.update({ where: { id: g.id }, data: { ownerId: demoOwner.id } });
  }

  const ownerSlots = await prisma.classSlot.findMany({
    where: { gymId: { in: ownerGyms.map((g) => g.id) } },
    orderBy: { startTime: "asc" },
  });

  const futureSlot = ownerSlots.find((s) => new Date(s.startTime).getTime() > Date.now() + 7 * 60 * 60 * 1000);
  if (futureSlot) {
    await prisma.booking.create({
      data: {
        userId: demoMember.id,
        classSlotId: futureSlot.id,
        status: "BOOKED",
        creditsPaid: futureSlot.creditCost,
      },
    });
    await prisma.classSlot.update({
      where: { id: futureSlot.id },
      data: { booked: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: demoMember.id },
      data: { creditBalance: { decrement: futureSlot.creditCost } },
    });
    await prisma.creditTransaction.create({
      data: { userId: demoMember.id, amount: -futureSlot.creditCost, type: "SPEND" },
    });
  }

  const pastSlot = ownerSlots.find((s) => new Date(s.startTime).getTime() < Date.now());
  if (pastSlot) {
    await prisma.booking.create({
      data: {
        userId: demoMember.id,
        classSlotId: pastSlot.id,
        status: "BOOKED",
        creditsPaid: pastSlot.creditCost,
      },
    });
    await prisma.classSlot.update({
      where: { id: pastSlot.id },
      data: { booked: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: demoMember.id },
      data: { creditBalance: { decrement: pastSlot.creditCost } },
    });
    await prisma.creditTransaction.create({
      data: { userId: demoMember.id, amount: -pastSlot.creditCost, type: "SPEND" },
    });
  }

  console.log(`Seeded ${gyms.length} gyms, demo member ${demoMember.id}, demo owner ${demoOwner.id}`);
  if (futureSlot) console.log("Demo booking (cancellable, future) created");
  if (pastSlot) console.log("Demo booking (past, ready for attend/no-show) created");
}

main().finally(() => prisma.$disconnect());
