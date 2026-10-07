import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

export const googleLogin = (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
  });

  res.redirect(authUrl);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Authorization code missing");
    }

    const { tokens } = await googleClient.getToken(code);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    console.log("Google user:", payload);

    res.json({
      message: "Google login successful",
      user: {
        name: payload.name,
        email: payload.email,
        profile_image: payload.picture,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).send("Google authentication failed");
  }
};