require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
const port = 5000;
const allowedOrigins = [
  "https://aws-facerekog-react-ljtj-vaibhav-dwivedis-projects-b50f3d64.vercel.app",
  "https://aws-facerekog-react-ljtj.vercel.app",
  "http://localhost:3000"
]

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    ['Access-Control-Allow-Origin', 'https://aws-facerekog-react-ljtj.vercel.app'],
    ['Access-Control-Allow-Credentials', 'true'],
    ['Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'],
    ['Access-Control-Allow-Headers', 'Content-Type, Authorization'],
  ]
}));
app.use(express.json());

// Configure AWS SDK with direct credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});


const rekognition = new AWS.Rekognition();

app.get("/", (req,res)=>{
  res.send("Welcome to FaceLiveness backend services");
})


app.get("/api/create-liveness-session", async (req, res) => {
  try {
    const params = {
      ClientRequestToken: `liveness-${Date.now()}`,
    };

    const data = await rekognition.createFaceLivenessSession(params).promise();
    res.json({ data, sessionId: data.SessionId });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error, error: error.message });
  }
});


app.get("/api/get-liveness-results", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const params = {
      SessionId: sessionId,
    };

    const data = await rekognition.getFaceLivenessSessionResults(params).promise();
    res.json({ data, isLive: data.Confidence > 75 });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error, error: error.message });
  }
});



// for detect-faces command request with image as param
app.post("/api/get-liveness-results", async (req, res) => {
    try {
        const { sessionId, image } = req.body;
    
        if (!sessionId || !image) {
          return res.status(400).json({ error: "Session ID and Image are required" });
        }
    
        // Convert Base64 image to Buffer
        const imageBuffer = Buffer.from(image, "base64");
    
        // const params = {
        //   SessionId: sessionId,
        //   Image: {
        //     Bytes: imageBuffer,
        //   },
        // };
        const params = {
            Image: { Bytes: imageBuffer },
            Attributes: ["ALL"],
          };
    
        const data = await rekognition.detectFaces(params).promise();

        if (data.FaceDetails.length === 0) {
        return res.json({ isLive: false, message: "No face detected" });
        }

        const face = data.FaceDetails[0];

        // Checking if the face appears live
        const isLive =
        face.Confidence > 90 &&
        face.EyesOpen?.Value &&
        face.MouthOpen?.Confidence > 90;

        res.json({ isLive, faceAttributes: face, fetchStatus:"Success" });
        // res.json({ data, isLive: data.Confidence > 90 });
      } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ error: error.message });
      }
  });


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
