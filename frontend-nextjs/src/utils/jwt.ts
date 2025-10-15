// src/utils/jwt.ts
// Helpers để đọc token từ cookie và giải mã JWT (an toàn với TS, hoạt động client/server)

import { jwtDecode } from 'jwt-decode';


export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function base64UrlToBase64(input: string): string {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad === 2) str += "==";
  else if (pad === 3) str += "=";
  else if (pad === 1) throw new Error("Invalid base64 string");
  return str;
}

function base64DecodeToUtf8(b64: string): string {
  // client: atob, server: Buffer
  if (typeof window !== "undefined" && typeof atob === "function") {
    // atob returns binary string; convert to UTF-8 string safely
    const bin = atob(b64);
    try {
      // percent-encode then decodeURIComponent to handle UTF-8 properly
      const percentEncoded = bin
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("");
      return decodeURIComponent(percentEncoded);
    } catch {
      // fallback to binary string if decoding fails
      return bin;
    }
  } else if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  } else {
    // last resort
    throw new Error("No base64 decoder available");
  }
}

export function base64UrlDecode(input: string): string {
  const b64 = base64UrlToBase64(input);
  return base64DecodeToUtf8(b64);
}

export type JwtPayload = Record<string, unknown>;

/**
 * Giải mã payload JWT — trả về object (hoặc null nếu bất kỳ lỗi nào).
 * Tránh sử dụng `any` để an toàn kiểu.
 */
export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadB64Url = parts[1];
    const json = base64UrlDecode(payloadB64Url);
    const obj = JSON.parse(json) as JwtPayload;
    return obj;
  } catch (e) {
    // invalid token
    // giữ console.error để debug khi dev; production có thể tắt
    // eslint-disable-next-line no-console
    console.error("decodeJwt error:", e);
    return null;
  }
}

/**
 * Lấy userId từ payload JWT.
 * Hỗ trợ các claim tên khác nhau: userID, userId, sub.
 */
export function getUserIdFromToken(token: string | null | undefined): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const maybeId = payload["userID"] ?? payload["userId"] ?? payload["sub"];
  if (typeof maybeId === "string") return maybeId;
  if (typeof maybeId === "number") return String(maybeId);
  return null;
}




/**
 * Lấy displayName từ payload JWT.
 */
export function getDisplayNameFromToken(token: string | null | undefined): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const displayName = payload["displayName"];
  return typeof displayName === "string" ? displayName : null;
}

/**
 * Lấy tất cả thông tin user từ JWT token
 */
export function getUserInfoFromToken(token?: string): {
  username: string | null;
  displayName: string | null;
  userID: string | null;
  roles: string[] | null;
} | null {
  if (!token) return null;
  try {
    const payload = jwtDecode(token) as Record<string, any>;
    
    return {
      username: payload.sub || payload.username || null,
      displayName: payload.displayName || null,
      userID: payload.userID || payload.userId || null,
      roles: payload.roles || null
    };
  } catch (e) {
    console.error('jwt-decode failed', e);
    return null;
  }
}

