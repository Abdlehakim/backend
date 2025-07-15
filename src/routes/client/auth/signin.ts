/* -------------------------------------------------------------------------- */
/*  routes/signin.ts                                                          */
/*  Mirrors dashboardSignin pattern: 4 h JWT + mirror‑expiry cookie           */
/* -------------------------------------------------------------------------- */

import { Router, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import Client, { IClient } from "@/models/Client";
import { COOKIE_OPTS, isProd } from "@/app";

/* ---------- env checks ---------------------------------------------------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID env variable");

/* ---------- helpers ------------------------------------------------------- */
const SHOULD_REFRESH_MS = 4 * 60 * 60 * 1000;          // 4 h
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/** Sign a 4 h JWT */
const signToken = (user: IClient) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "4h",
  });

/** Set both auth cookies (token + mirror exp) */
function setAuthCookies(
  res: Parameters<RequestHandler>[1],
  token: string
): void {
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common = { ...COOKIE_OPTS, maxAge: SHOULD_REFRESH_MS, path: "/" };
  if (!isProd) delete (common as any).domain; // avoid localhost cookie issue

  // ① real JWT — HttpOnly
  res.cookie("token_FrontEnd", token, {
    ...common,
    httpOnly: true,
  });

  // ② mirror expiry — JS‑readable
  res.cookie("token_FrontEnd_exp", expMs, {
    ...common,
    httpOnly: false,
  });
}

/* ========================================================================== */
/*  1) Email / Password Sign‑in                                               */
/* ========================================================================== */
const router = Router();

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
    const user = await Client.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user || !user.password || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken(user);
    setAuthCookies(res, token);

    res.json({
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    console.error("Sign‑in Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ========================================================================== */
/*  2) Google OAuth Sign‑in                                                   */
/* ========================================================================== */
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
      // @ts-expect-error – phone isn’t in the official type but we accept it
      (payload.phone as string | undefined) ?? "";

    /* ---------- upsert user ---------- */
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

    const token = signToken(user);
    setAuthCookies(res, token);

    res.json({
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    console.error("Google Sign‑in Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
