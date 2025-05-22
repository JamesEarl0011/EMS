// * Token Management Utility
// @ file: Handles JWT token operations and blacklisting

import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

// * Token configuration
const ACCESS_TOKEN_EXPIRY = "24h"; // Changed from 15m to 24h
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

// ? Generate access token
export const generateAccessToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// ? Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

// ? Store refresh token in Redis
export const storeRefreshToken = async (userId, refreshToken) => {
  await redisClient.setEx(
    `refresh_${userId}`,
    7 * 24 * 60 * 60, // 7 days in seconds
    refreshToken
  );
};

// ? Verify access token and check if blacklisted
export const verifyToken = async (token) => {
  try {
    // * Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
      throw new Error("Token is blacklisted");
    }

    // * Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.status = 401;
      error.message = "Access token expired";
    }
    throw error;
  }
};

// ? Verify refresh token
export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // * Check if refresh token exists in Redis
    const storedToken = await redisClient.get(`refresh_${decoded.userId}`);
    if (!storedToken || storedToken !== token) {
      throw new Error("Invalid refresh token");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.status = 401;
      error.message = "Refresh token expired";
    }
    throw error;
  }
};

// ? Blacklist a token
export const blacklistToken = async (token, expiresIn = 24 * 60 * 60) => {
  try {
    // * Store token in blacklist
    await redisClient.setEx(`bl_${token}`, expiresIn, "true");
  } catch (error) {
    console.error("Error blacklisting token:", error);
    throw error;
  }
};
