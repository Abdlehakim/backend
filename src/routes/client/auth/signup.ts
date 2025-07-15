/* ------------------------------------------------------------------ */
/*  src/routes/auth/signup.ts                                         */
/*  Registers a new user + issues the same 4 h JWT & twin cookies     */
/* ------------------------------------------------------------------ */

import { Router, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import Client, { IClient } from "@/models/Client";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

/* ---------- env checks ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

/* ---------- helpers ------------------------------------------------ */
const SHOULD_REFRESH_MS = 4 * 60 * 60 * 1000; // 4 h

/** Sign a short‑lived JWT */
const signToken = (user: IClient) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET!, {
    expiresIn: "4h",
  });

/** Write “token_FrontEnd” + “token_FrontEnd_exp” cookies */
function setAuthCookies(
  res: Parameters<RequestHandler>[1],
  token: string
): void {
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common = { ...COOKIE_OPTS, maxAge: SHOULD_REFRESH_MS, path: "/" };
  if (!isProd) delete (common as any).domain; // keep localhost happy

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

/* ---------- route -------------------------------------------------- */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, phone, email, password } = req.body as {
      username?: unknown;
      phone?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res
        .status(400)
        .json({ message: "Username, email, and password are required." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await Client.findOne({ email: normalizedEmail })) {
      res.status(409).json({ message: "Email is already in use." });
      return;
    }

    const newUser = await Client.create({
      username: username.trim(),
      phone: typeof phone === "string" ? phone.trim() : "",
      email: normalizedEmail,
      password,
    });

    // Immediately authenticate
    const token = signToken(newUser);
    setAuthCookies(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
