import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
    databaseURL: "https://<YOUR-FIREBASE-PROJECT>.firebaseio.com"
  });
}

const db = admin.database();

function generateCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { longUrl } = req.body;
  if (!longUrl) return res.status(400).send("No URL provided");

  const code = generateCode();
  await db.ref("shortUrls/" + code).set({
    originalUrl: longUrl,
    clicks: 0
  });

  res.status(200).json({
    code,
    shortUrl: `${req.headers.origin}/${code}`
  });
}
