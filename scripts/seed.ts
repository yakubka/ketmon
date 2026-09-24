import { PrismaClient, VenueTier } from "@prisma/client";
import { resolveTimeBand, creditPrice } from "../lib/pricing";
import { distanceKm } from "../lib/distance";

const prisma = new PrismaClient();

const BBOX = "37.400,126.665,37.425,126.695";
const INCHEON_CENTER = { lat: 37.4106, lng: 126.6784 };
const KEEP_RADIUS_KM = 8;

async function pruneStaleGyms() {
  const gyms = await prisma.gym.findMany({ select: { id: true, lat: true, lng: true } });
  const staleIds = gyms
    .filter((g) => distanceKm(INCHEON_CENTER.lat, INCHEON_CENTER.lng, g.lat, g.lng) > KEEP_RADIUS_KM)
    .map((g) => g.id);

  if (staleIds.length === 0) return;

  const staleSlots = await prisma.classSlot.findMany({
    where: { gymId: { in: staleIds } },
    select: { id: true },
  });
  const staleSlotIds = staleSlots.map((s) => s.id);

  await prisma.booking.deleteMany({ where: { classSlotId: { in: staleSlotIds } } });
  await prisma.commission.deleteMany({ where: { gymId: { in: staleIds } } });
  await prisma.classSlot.deleteMany({ where: { gymId: { in: staleIds } } });
  await prisma.activity.deleteMany({ where: { gymId: { in: staleIds } } });
  await prisma.gym.deleteMany({ where: { id: { in: staleIds } } });

  console.log(`Pruned ${staleIds.length} gym(s) outside ${KEEP_RADIUS_KM}km of Incheon Yeonsu`);
}

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
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400&h=300&fit=crop",
];

const FALLBACK_GYMS = [
  { name: "연수 피트니스", lat: 37.4106, lng: 126.6784, pop: 85, area: "연수동" },
  { name: "청학 헬스클럽", lat: 37.4080, lng: 126.6720, pop: 72, area: "청학동" },
  { name: "옥련 요가원", lat: 37.4130, lng: 126.6650, pop: 65, area: "옥련동" },
  { name: "동춘 복싱짐", lat: 37.4020, lng: 126.6810, pop: 78, area: "동춘동" },
  { name: "선학 필라테스", lat: 37.4050, lng: 126.6900, pop: 42, area: "선학동" },
  { name: "연수역 크로스핏", lat: 37.4120, lng: 126.6750, pop: 90, area: "연수동" },
  { name: "송도 스포츠센터", lat: 37.3830, lng: 126.6600, pop: 92, area: "송도동" },
  { name: "송도 수영장", lat: 37.3810, lng: 126.6560, pop: 80, area: "송도동" },
  { name: "연수구 복합체육관", lat: 37.4100, lng: 126.6800, pop: 75, area: "연수동" },
  { name: "문학 댄스스튜디오", lat: 37.4200, lng: 126.6850, pop: 55, area: "문학동" },
  { name: "학익 헬스", lat: 37.4350, lng: 126.6700, pop: 48, area: "학익동" },
  { name: "옥련 크로스핏박스", lat: 37.4140, lng: 126.6630, pop: 30, area: "옥련동" },
  { name: "동춘 요가스튜디오", lat: 37.4000, lng: 126.6830, pop: 25, area: "동춘동" },
  { name: "연수 무술도장", lat: 37.4115, lng: 126.6770, pop: 35, area: "연수동" },
  { name: "청학 필라테스", lat: 37.4060, lng: 126.6710, pop: 60, area: "청학동" },
  { name: "송도 테니스코트", lat: 37.3850, lng: 126.6640, pop: 70, area: "송도동" },
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
  await pruneStaleGyms();

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
