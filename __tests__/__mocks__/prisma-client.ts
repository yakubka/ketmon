export const TimeBand = {
  OFF_PEAK: "OFF_PEAK",
  STANDARD: "STANDARD",
  PEAK: "PEAK",
} as const;

export const VenueTier = {
  NEIGHBORHOOD: "NEIGHBORHOOD",
  MID: "MID",
  PREMIUM: "PREMIUM",
} as const;

export const BookingStatus = {
  BOOKED: "BOOKED",
  ATTENDED: "ATTENDED",
  LATE_CANCELLED: "LATE_CANCELLED",
  NO_SHOW: "NO_SHOW",
  CANCELLED: "CANCELLED",
} as const;

export const TxnType = {
  PURCHASE: "PURCHASE",
  SPEND: "SPEND",
  REFUND: "REFUND",
} as const;

export const Role = {
  MEMBER: "MEMBER",
  OWNER: "OWNER",
} as const;
