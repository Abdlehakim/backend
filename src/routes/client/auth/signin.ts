/* ------------------------------------------------------------------
   src/routes/signin.ts
------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import jwt from "jsonwebtoken";
import Client, { IClient } from "@/models/Client";
import {
  issueClientToken,
  setClientSessionCookies,
} from "./sessionClient";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function setNoStore(res: Response) {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    Vary: "Cookie",
  });
}

router.post("/", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const { email, password } = req.body as { email?: unknown; password?: unknown };
    if (typeof email !== "string" || typeof password !== "string") {
      return void res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await Client.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !user.password || !(await (user as any).comparePassword(password))) {
      return void res.status(401).json({ message: "Invalid credentials" });
    }

    const token = issueClientToken(String(user._id));
    setClientSessionCookies(res, token);
    return void res.json({ user: { id: user._id.toString(), email: user.email } });
  } catch (err) {
    console.error("Sign-in Error:", err);
    return void res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    setNoStore(res);
    const { idToken } = req.body as { idToken?: unknown };
    if (typeof idToken !== "string") {
      return void res.status(400).json({ message: "idToken is required" });
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload() as TokenPayload | null;
    if (!payload?.email) {
      return void res.status(401).json({ message: "Google authentication failed" });
    }

    const email = payload.email.trim().toLowerCase();
    const name = payload.name || payload.given_name || "";
    // @ts-expect-error phone may exist on some payloads
    const phone: string | undefined = payload.phone;

    let user = await Client.findOne({ email });
    if (user) {
      let updated = false;
      if (name && user.username !== name) { user.username = name; updated = true; }
      if (phone && user.phone !== phone) { user.phone = phone; updated = true; }
      if (updated) await user.save();
    } else {
      user = await Client.create({ email, username: name, phone, isGoogleAccount: true });
    }

    const token = issueClientToken(String(user._id));
    setClientSessionCookies(res, token);
    return void res.json({ user: { id: user._id.toString(), email: user.email } });
  } catch (err) {
    console.error("Google Sign-in Error:", err);
    return void res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
