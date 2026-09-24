import { PrismaClient, VenueTier } from "@prisma/client";
import { resolveTimeBand, creditPrice } from "../lib/pricing";

const prisma = new PrismaClient();

const BBOX = "37.490,127.010,37.530,127.060";

const SPORTS = [
  { sport: "pilates", name: "필라테스 (Pilates)" },
  { sport: "boxing", name: "복싱 (Boxing)" },
  { sport: "yoga", name: "요가 (Yoga)" },
  { sport: "gym", name: "헬스 (Gym)" },
  { sport: "crossfit", name: "크로스핏 (CrossFit)" },
  { sport: "swimming", name: "수영 (Swimming)" },
  { sport: "dance", name: "댄스 (Dance)" },
  { sport: "martial_arts", name: "무술 (Martial Arts)" },
];

const GYM_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop",
];

const FALLBACK_GYMS = [
  { name: "강남 피트니스", lat: 37.4979, lng: 127.0276, pop: 85, area: "강남" },
  { name: "역삼 요가룸", lat: 37.5007, lng: 127.0365, pop: 72, area: "역삼" },
  { name: "선릉 복싱짐", lat: 37.5045, lng: 127.0490, pop: 65, area: "선릉" },
  { name: "삼성 필라테스", lat: 37.5088, lng: 127.0630, pop: 78, area: "삼성" },
  { name: "논현 크로스핏", lat: 37.5100, lng: 127.0250, pop: 42, area: "논현" },
  { name: "청담 스튜디오", lat: 37.5200, lng: 127.0470, pop: 90, area: "청담" },
  { name: "신논현 헬스클럽", lat: 37.5040, lng: 127.0240, pop: 55, area: "신논현" },
  { name: "대치 짐", lat: 37.4940, lng: 127.0580, pop: 30, area: "대치" },
  { name: "도곡 요가", lat: 37.4880, lng: 127.0440, pop: 25, area: "도곡" },
  { name: "압구정 필라테스", lat: 37.5250, lng: 127.0280, pop: 88, area: "압구정" },
  { name: "학동 복싱", lat: 37.5140, lng: 127.0310, pop: 35, area: "학동" },
  { name: "양재 헬스", lat: 37.4840, lng: 127.0350, pop: 48, area: "양재" },
  { name: "개포 크로스핏", lat: 37.4790, lng: 127.0480, pop: 20, area: "개포" },
  { name: "일원 스튜디오", lat: 37.4830, lng: 127.0820, pop: 28, area: "일원" },
  { name: "수서 짐", lat: 37.4870, lng: 127.1000, pop: 22, area: "수서" },
  { name: "잠실 필라테스", lat: 37.5130, lng: 127.1000, pop: 75, area: "잠실" },
  { name: "선정릉 요가", lat: 37.5100, lng: 127.0430, pop: 60, area: "선정릉" },
  { name: "강남역 헬스", lat: 37.4970, lng: 127.0280, pop: 92, area: "강남" },
  { name: "교대 복싱짐", lat: 37.4930, lng: 127.0140, pop: 50, area: "교대" },
  { name: "매봉 크로스핏", lat: 37.4870, lng: 127.0330, pop: 18, area: "매봉" },
  { name: "한티 스튜디오", lat: 37.5010, lng: 127.0530, pop: 32, area: "한티" },
  { name: "뱅뱅 피트니스", lat: 37.5020, lng: 127.0260, pop: 70, area: "강남" },
  { name: "도산 요가룸", lat: 37.5220, lng: 127.0380, pop: 82, area: "압구정" },
  { name: "세곡 헬스장", lat: 37.4700, lng: 127.0600, pop: 15, area: "세곡" },
];

async function fetchOverpass(): Promise<Array<{ name: string; lat: number; lng: number; address?: string; sport?: string }>> {
  const query = `
    [out:json][timeout:25];
    (
      node["leisure"="fitness_centre"](${BBOX});
      node["leisure"="sports_centre"](${BBOX});
      node["sport"](${BBOX});
      way["leisure"="fitness_centre"](${BBOX});
      way["leisure"="sports_centre"](${BBOX});
    );
    out center tags;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Ketmon/1.0 (hackathon project)",
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const results: Array<{ name: string; lat: number; lng: number; address?: string; sport?: string }> = [];

    for (const el of data.elements ?? []) {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) continue;

      const name = el.tags?.name ?? el.tags?.["name:ko"] ?? null;
      if (!name) continue;

      const addr = el.tags?.["addr:full"]
        ?? el.tags?.["addr:street"]
        ?? el.tags?.["addr:district"]
        ?? null;
      const sport = el.tags?.sport ?? el.tags?.leisure ?? null;

      results.push({ name, lat, lng, address: addr, sport });
    }

    console.log(`Overpass returned ${results.length} named venues`);
    return results;
  } catch (e) {
    console.log(`Overpass failed: ${e}, using fallback data`);
    return [];
  }
}

function pickTier(popularity: number): VenueTier {
  if (popularity >= 70) return VenueTier.PREMIUM;
  if (popularity >= 40) return VenueTier.MID;
  return VenueTier.NEIGHBORHOOD;
}

function sportToActivity(sport?: string): { sport: string; name: string }[] {
  if (!sport) return [];
  const s = sport.toLowerCase();
  if (s.includes("yoga")) return [{ sport: "yoga", name: "요가 (Yoga)" }];
  if (s.includes("swimming") || s.includes("pool")) return [{ sport: "swimming", name: "수영 (Swimming)" }];
  if (s.includes("boxing")) return [{ sport: "boxing", name: "복싱 (Boxing)" }];
  if (s.includes("fitness") || s.includes("gym") || s.includes("weight")) return [{ sport: "gym", name: "헬스 (Gym)" }];
  if (s.includes("dance")) return [{ sport: "dance", name: "댄스 (Dance)" }];
  if (s.includes("martial") || s.includes("taekwondo") || s.includes("judo")) return [{ sport: "martial_arts", name: "무술 (Martial Arts)" }];
  if (s.includes("pilates")) return [{ sport: "pilates", name: "필라테스 (Pilates)" }];
  if (s.includes("crossfit")) return [{ sport: "crossfit", name: "크로스핏 (CrossFit)" }];
  return [];
}

async function main() {
  const osmVenues = await fetchOverpass();
  const gyms = [];

  if (osmVenues.length >= 10) {
    for (let i = 0; i < Math.min(osmVenues.length, 30); i++) {
      const v = osmVenues[i];
      const pop = Math.floor(Math.random() * 100);
      const tier = pickTier(pop);
      const allowsPeak = tier === VenueTier.NEIGHBORHOOD || pop < 40;

      const area = v.address?.split(" ").find((w) => w.endsWith("동") || w.endsWith("구")) ?? null;

      const gym = await prisma.gym.create({
        data: {
          name: v.name,
          lat: v.lat,
          lng: v.lng,
          address: v.address ?? null,
          area,
          imageUrl: GYM_IMAGES[i % GYM_IMAGES.length],
          tier,
          allowsPeak,
          rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
          popularity: pop,
        },
      });
      gyms.push(gym);

      const osmActivities = sportToActivity(v.sport);
      const shuffled = [...SPORTS].sort(() => Math.random() - 0.5);
      const picked = osmActivities.length > 0
        ? [...osmActivities, ...shuffled.filter((s) => !osmActivities.some((o) => o.sport === s.sport)).slice(0, 2)]
        : shuffled.slice(0, 3 + Math.floor(Math.random() * 3));

      for (const a of picked) {
        const activity = await prisma.activity.create({
          data: { gymId: gym.id, name: a.name, sport: a.sport, durationMin: 50 },
        });

        for (let day = 0; day < 7; day++) {
          for (const hour of [7, 10, 12, 15, 18, 20]) {
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
                capacity: 8 + Math.floor(Math.random() * 8),
                booked: Math.floor(Math.random() * 4),
                creditCost: creditPrice(gym.tier, band),
              },
            });
          }
        }
      }
    }
  } else {
    for (let i = 0; i < FALLBACK_GYMS.length; i++) {
      const g = FALLBACK_GYMS[i];
      const tier = pickTier(g.pop);
      const allowsPeak = tier === VenueTier.NEIGHBORHOOD || g.pop < 40;

      const gym = await prisma.gym.create({
        data: {
          name: g.name,
          lat: g.lat,
          lng: g.lng,
          area: g.area,
          imageUrl: GYM_IMAGES[i % GYM_IMAGES.length],
          tier,
          allowsPeak,
          rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
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
          for (const hour of [7, 10, 12, 15, 18, 20]) {
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
                capacity: 8 + Math.floor(Math.random() * 8),
                booked: Math.floor(Math.random() * 4),
                creditCost: creditPrice(gym.tier, band),
              },
            });
          }
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
      data: { userId: demoMember.id, classSlotId: futureSlot.id, status: "BOOKED", creditsPaid: futureSlot.creditCost },
    });
    await prisma.classSlot.update({ where: { id: futureSlot.id }, data: { booked: { increment: 1 } } });
    await prisma.user.update({ where: { id: demoMember.id }, data: { creditBalance: { decrement: futureSlot.creditCost } } });
    await prisma.creditTransaction.create({ data: { userId: demoMember.id, amount: -futureSlot.creditCost, type: "SPEND" } });
  }

  const pastSlot = ownerSlots.find((s) => new Date(s.startTime).getTime() < Date.now());
  if (pastSlot) {
    await prisma.booking.create({
      data: { userId: demoMember.id, classSlotId: pastSlot.id, status: "BOOKED", creditsPaid: pastSlot.creditCost },
    });
    await prisma.classSlot.update({ where: { id: pastSlot.id }, data: { booked: { increment: 1 } } });
    await prisma.user.update({ where: { id: demoMember.id }, data: { creditBalance: { decrement: pastSlot.creditCost } } });
    await prisma.creditTransaction.create({ data: { userId: demoMember.id, amount: -pastSlot.creditCost, type: "SPEND" } });
  }

  console.log(`Seeded ${gyms.length} gyms, demo member ${demoMember.id}, demo owner ${demoOwner.id}`);
  if (futureSlot) console.log("Demo booking (cancellable, future) created");
  if (pastSlot) console.log("Demo booking (past, ready for attend/no-show) created");
}

main().finally(() => prisma.$disconnect());
