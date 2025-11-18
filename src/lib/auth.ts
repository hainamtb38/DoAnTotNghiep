import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key"; // Sử dụng biến môi trường

/**
 * Tạo token JWT.
 * @param userId - ID của người dùng.
 * @returns Token JWT.
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" }); // Token có hiệu lực 7 ngày
}

/**
 * Xác thực và giải mã token JWT.
 * @param token - Token cần xác thực.
 * @returns Thông tin giải mã từ token hoặc null nếu không hợp lệ.
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { userId: string };
  } catch (error) {
    console.error("[verifyToken] Invalid token:", error);
    return null;
  }
}