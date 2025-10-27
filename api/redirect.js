import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
    databaseURL: "https://<YOUR-FIREBASE-PROJECT>.firebaseio.com"
  });
}

const db = admin.database();

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("No code provided");

    const snapshot = await db.ref("shortUrls/" + code).once("value");
    if (!snapshot.exists()) return res.status(404).send("Short URL not found");

    const data = snapshot.val();
    await db.ref("shortUrls/" + code).update({ clicks: (data.clicks || 0) + 1 });

    // Redirect to original URL
    res.writeHead(302, { Location: data.originalUrl });
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}
