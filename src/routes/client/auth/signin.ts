/* ---------------------------------------------------------------
   routes/signin.ts   (strict TypeScript, dev/prod-aware cookies)
---------------------------------------------------------------- */

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import Client, { IClient } from "@/models/Client";

/* ---------- Environment checks ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID env variable");

const isProd = process.env.NODE_ENV === "production";

/* ---------- Helpers ---------- */
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function generateToken(user: IClient): string {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET as string,
    { expiresIn: "1h" }
  );
}

function setAuthCookie(res: Response, token: string): void {
  res.cookie("token_FrontEndAdmin", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true on Render
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 1000, // 1 h
});
}

const router = Router();

/* ==============================================================
   1) Email / Password Sign-in
================================================================ */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await Client.findOne({ email: normalizedEmail });

    if (!user || !user.password || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({ user: { id: user._id.toString(), email: user.email } });
  } catch (err) {
    console.error("Sign-in Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ==============================================================
   2) Google OAuth Sign-in
================================================================ */
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body as { idToken?: unknown };

    if (typeof idToken !== "string") {
      res.status(400).json({ message: "idToken is required" });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as TokenPayload | null;
    if (!payload?.email) {
      res.status(401).json({ message: "Google authentication failed" });
      return;
    }

    const email = payload.email.trim().toLowerCase();
    const name = payload.name || payload.given_name || "";
    const phone =
      // @ts-expect-error – phone isn’t in the official type but we’ll accept it
      (payload.phone as string | undefined) ?? "";

    // Upsert user
    let user = await Client.findOne({ email });
    if (user) {
      let updated = false;
      if (name && user.username !== name) {
        user.username = name;
        updated = true;
      }
      if (phone && user.phone !== phone) {
        user.phone = phone;
        updated = true;
      }
      if (updated) await user.save();
    } else {
      user = await Client.create({
        email,
        username: name,
        phone,
        isGoogleAccount: true,
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({ user: { id: user._id.toString(), email: user.email } });
  } catch (err) {
    console.error("Google Sign-in Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
