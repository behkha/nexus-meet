import app from "./app.ts";
import config from "#src/config/config.ts";
import routes from "./routes/index.route.ts";
import { AccessToken } from 'livekit-server-sdk'

// async function createToken(roomName: string, participantName: string) {
//   const at = new AccessToken(
//     process.env.LIVEKIT_API_KEY,
//     process.env.LIVEKIT_API_SECRET,
//     {
//       identity: participantName,
//       ttl: '10m'
//     }
//   );

//   at.addGrant({
//     roomJoin: true,
//     room: roomName,
//     canPublish: true,
//     canSubscribe: true
//   });

//   return at.toJwt()
// }

// app.post('/api/join', async (req, res) => {
//   const { roomName, participantName } = req.body;

//   if (!roomName || !participantName) {
//     return res.status(400).json({ error: 'Missing fields' })
//   }

//   try {
//     const token = await createToken(roomName, participantName);
//     res.json({ token })
//   } catch (error) {
//     res.status(500).json({ error })
//   }
// })

app.use('/api', routes)

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})