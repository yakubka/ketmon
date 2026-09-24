import { PrismaClient, VenueTier } from "@prisma/client";
import { resolveTimeBand, creditPrice } from "../lib/pricing";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// README §7 — 강남 Gangnam bounding box. Swap for 마포/홍대 if preferred.
const BBOX = "37.490,127.010,37.530,127.050"; // south,west,north,east
const CACHE_PATH = path.join(__dirname, "overpass-cache.json");

const SPORTS = [
  { sport: "pilates", name: "필라테스 (Pilates)" },
  { sport: "boxing", name: "복싱 (Boxing)" },
  { sport: "yoga", name: "요가 (Yoga)" },
  { sport: "gym", name: "헬스 (Gym)" },
  { sport: "crossfit", name: "크로스핏 (CrossFit)" },
  { sport: "swimming", name: "수영 (Swimming)" },
];

const SYNTHETIC_NAMES = [
  "강남 피트니스", "역삼 요가룸", "선릉 복싱짐", "삼성 필라테스",
  "논현 크로스핏", "청담 스튜디오", "신논현 헬스클럽", "대치 짐",
];

async function fetchOverpass() {
  if (fs.existsSync(CACHE_PATH)) {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  }
  const query = `
    [out:json][timeout:25];
    (
      node["leisure"="fitness_centre"](${BBOX});
      node["leisure"="sports_centre"](${BBOX});
      node["sport"~"yoga|fitness|boxing"](${BBOX});
      way["leisure"="fitness_centre"](${BBOX});
    );
    out center;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });
  const data = await res.json();
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
  return data;
}

function pickTier(popularity: number): VenueTier {
  if (popularity >= 70) return VenueTier.PREMIUM;
  if (popularity >= 40) return VenueTier.MID;
  return VenueTier.NEIGHBORHOOD;
}

async function main() {
  const overpass = await fetchOverpass();
  const elements = (overpass.elements ?? []).slice(0, 24);

  let synthIdx = 0;
  const gyms = [];

  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!lat || !lng) continue;

    const name = el.tags?.name ?? SYNTHETIC_NAMES[synthIdx++ % SYNTHETIC_NAMES.length];
    const popularity = Math.floor(Math.random() * 100);
    const tier = pickTier(popularity);

    // README §3.5 — two-tier supply strategy baked into seed data.
    // Popular PREMIUM/MID gyms: off-peak only. NEIGHBORHOOD/low-popularity: peak enabled.
    const allowsPeak = tier === VenueTier.NEIGHBORHOOD || popularity < 40;

    const gym = await prisma.gym.create({
      data: {
        name,
        lat,
        lng,
        address: el.tags?.["addr:full"] ?? null,
        tier,
        allowsPeak,
        rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
        popularity,
      },
    });
    gyms.push(gym);

    // 3-6 activities per gym
    const shuffled = [...SPORTS].sort(() => Math.random() - 0.5);
    const activities = shuffled.slice(0, 3 + Math.floor(Math.random() * 4));
    for (const a of activities) {
      const activity = await prisma.activity.create({
        data: { gymId: gym.id, name: a.name, sport: a.sport, durationMin: 50 },
      });

      // Slots across the next 7 days
      for (let day = 0; day < 7; day++) {
        const hours = [8, 12, 18]; // one peak-ish, one off-peak, one peak/evening sample
        for (const hour of hours) {
          const startTime = new Date();
          startTime.setDate(startTime.getDate() + day);
          startTime.setHours(hour, 0, 0, 0);

          const band = resolveTimeBand(startTime);
          if (band === "PEAK" && !gym.allowsPeak) continue; // respect allowsPeak

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

  // Demo personas — README §7.5
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
      data: {
        userId: demoMember.id,
        amount: -futureSlot.creditCost,
        type: "SPEND",
      },
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
      data: {
        userId: demoMember.id,
        amount: -pastSlot.creditCost,
        type: "SPEND",
      },
    });
  }

  console.log(`Seeded ${gyms.length} gyms, demo member ${demoMember.id}, demo owner ${demoOwner.id}`);
  if (futureSlot) console.log("Demo booking (cancellable, future) created");
  if (pastSlot) console.log("Demo booking (past, ready for attend/no-show) created");
}

main().finally(() => prisma.$disconnect());
