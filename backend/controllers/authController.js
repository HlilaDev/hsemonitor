const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const Company = require("../models/companyModel");
const { createSessionLog } = require("../services/sessionLogService");

// Helper: create JWT
const signToken = (user, sessionId) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      sessionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, company } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "firstName, lastName, email, password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (company) {
      const companyExists = await Company.findById(company);
      if (!companyExists) {
        return res.status(400).json({ message: "Invalid company id" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      password: hashed,
      role: role || "agent",
      company: company || null,
    });

    const sessionId = crypto.randomUUID();
    const token = signToken(user, sessionId);

    res.cookie("access_token", token, cookieOptions);

    await createSessionLog({
      req,
      user,
      status: "success",
      reason: "Register success",
      sessionId,
    });

    const safeUser = await User.findById(user._id)
      .select("-password")
      .populate("company", "_id name industry");

    return res.status(201).json({ user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail })
      .select("+password")
      .populate("company", "_id name industry");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      await createSessionLog({
        req,
        user,
        status: "failed",
        reason: "Wrong password",
        sessionId: crypto.randomUUID(),
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const sessionId = crypto.randomUUID();
    const token = signToken(user, sessionId);

    res.cookie("access_token", token, cookieOptions);

    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      company: user.company,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    await createSessionLog({
      req,
      user,
      status: "success",
      reason: "Login success",
      sessionId,
    });

    return res.status(200).json({ user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({ message: "Logged out" });
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("company", "_id name industry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};