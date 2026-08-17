import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Daftar Kurir yang Didukung ──────────────────────────────────────────────

export const COURIERS = [
  { code: "jne",       label: "JNE",            icon: "🟡" },
  { code: "jnt",       label: "J&T Express",    icon: "🔴" },
  { code: "sicepat",   label: "SiCepat",        icon: "🟢" },
  { code: "pos",       label: "Pos Indonesia",  icon: "🔵" },
  { code: "tiki",      label: "TIKI",           icon: "🟠" },
  { code: "anteraja",  label: "Anteraja",       icon: "⚫" },
  { code: "ninja",     label: "Ninja Xpress",   icon: "⚡" },
  { code: "sap",       label: "SAP Express",    icon: "🏷️" },
  { code: "lion",      label: "Lion Parcel",    icon: "🦁" },
  { code: "idexpress", label: "ID Express",     icon: "📮" },
] as const;

export type CourierCode = typeof COURIERS[number]["code"];

// ─── Types ───────────────────────────────────────────────────────────────────

export type CourierHistoryItem = {
  date: string;
  desc: string;
  location: string;
};

export type CourierTrackResult = {
  courier: string;
  courier_label: string;
  awb: string;
  status: string;
  status_label: string;
  receiver: string;
  date: string;
  desc: string;
  history: CourierHistoryItem[];
};

// ─── Normalize BinderByte Response ──────────────────────────────────────────

function normalizeStatus(rawStatus: string): string {
  const s = rawStatus.toUpperCase();
  if (s.includes("DELIVERED") || s.includes("DITERIMA")) return "DELIVERED";
  if (s.includes("OUT_FOR_DELIVERY") || s.includes("ANTAR")) return "OUT_FOR_DELIVERY";
  if (s.includes("IN_TRANSIT") || s.includes("TRANSIT") || s.includes("BERANGKAT")) return "IN_TRANSIT";
  if (s.includes("ON_PROCESS") || s.includes("PROCESS") || s.includes("PROSES")) return "ON_PROCESS";
  if (s.includes("PICKED") || s.includes("PICKUP")) return "PICKED_UP";
  return "IN_TRANSIT";
}

function statusLabel(status: string): string {
  switch (status) {
    case "DELIVERED":        return "Paket Terkirim ✅";
    case "OUT_FOR_DELIVERY": return "Sedang Diantar 🚚";
    case "IN_TRANSIT":       return "Dalam Perjalanan 📦";
    case "ON_PROCESS":       return "Sedang Diproses ⚙️";
    case "PICKED_UP":        return "Paket Diambil Kurir 📋";
    default:                 return "Dalam Perjalanan 📦";
  }
}

function normalizeBBResponse(json: any, courierCode: string): CourierTrackResult {
  const data     = json?.data ?? {};
  const summary  = data?.summary ?? {};
  const history  = (data?.history ?? []) as Array<{ date: string; desc: string; location?: string }>;
  const rawStatus    = summary?.status ?? "IN_TRANSIT";
  const normalStatus = normalizeStatus(rawStatus);
  const courierObj   = COURIERS.find((c) => c.code === courierCode);

  return {
    courier:       courierCode,
    courier_label: courierObj?.label ?? courierCode.toUpperCase(),
    awb:           summary?.awb_number ?? "",
    status:        normalStatus,
    status_label:  statusLabel(normalStatus),
    receiver:      summary?.receiver ?? "",
    date:          summary?.date ?? "",
    desc:          summary?.desc ?? "",
    history:       history.map((h) => ({
      date:     h.date ?? "",
      desc:     h.desc ?? "",
      location: h.location ?? "",
    })),
  };
}

// ─── Server Function: Track Courier ─────────────────────────────────────────

export const trackCourier = createServerFn({ method: "POST" })
  .inputValidator((d: { courier: string; awb: string }) =>
    z
      .object({
        courier: z.string().min(1),
        awb:     z.string().min(4).max(100),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["BINDERBYTE_API_KEY"];
    if (!apiKey || apiKey === "ISI_API_KEY_BINDERBYTE_ANDA_DISINI") {
      throw new Error("BINDERBYTE_API_KEY belum dikonfigurasi. Mohon isi nilai BINDERBYTE_API_KEY di file .env");
    }

    const awb     = data.awb.trim();
    const courier = data.courier.trim().toLowerCase();

    const url = `https://api.binderbyte.com/v1/track?api_key=${encodeURIComponent(apiKey)}&courier=${encodeURIComponent(courier)}&awb=${encodeURIComponent(awb)}`;

    let json: any;
    try {
      const res = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(12_000),
      });
      json = await res.json();
    } catch {
      throw new Error("Gagal menghubungi server tracking. Coba beberapa saat lagi.");
    }

    if (json?.status !== 200) {
      const msg = String(json?.message ?? "Nomor resi tidak ditemukan");
      if (msg.toLowerCase().includes("not found") || json?.status === 400) {
        throw new Error("Nomor resi tidak ditemukan. Pastikan nomor resi dan kurir yang dipilih sudah benar.");
      }
      throw new Error(msg);
    }

    return normalizeBBResponse(json, courier) as CourierTrackResult;
  });
