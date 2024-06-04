require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import { willSponsor } from "./utils/sponsor";
import { paymasterClient } from "./config/paymasterConfig";
// import https from "https";
// import fs from "fs";
// import path from "path";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 8000;
const paymasterService = process.env.PAYMASTER_SERVICE_URL;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/paym", async (req: Request, res: Response) => {
  try {
    const method = req.body.method;
    // if (!req.body?.params?.chainId) {
    //   return res.status(400).json({ error: "Missing required parameters" });
    // }
    const [userOp, entrypoint, chainId] = req.body.params;

    const willSponsorCheck = await willSponsor({
      chainId: parseInt(chainId),
      entrypoint,
      userOp,
    });
    console.log("willSponsorCheck == ", willSponsorCheck);
    if (!willSponsorCheck) {
      return res.json({ error: "Not a sponsorable operation" });
    }

    // Method 1
    // if (["pm_getPaymasterStubData", "pm_getPaymasterData"].includes(method)) {
    //   const fetchRes = await fetch(paymasterService, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     method: "POST",
    //     body: JSON.stringify(req.body),
    //   });

    //   console.log("fetchRes -----------------------", fetchRes);

    //   console.log("fetchRes-----------", fetchRes);
    //   return res.json(await fetchRes.json());
    // }
    // return res.json({ error: "Method not found" });

    // Method 2
    if (method === "pm_getPaymasterStubData") {
      const result = await paymasterClient.getPaymasterStubData({
        userOperation: userOp,
      });
      console.log(
        "pm_getPaymasterStubData result --------------------------",
        result
      );
      return res.json({ result });
    } else if (method === "pm_getPaymasterData") {
      const result = await paymasterClient.getPaymasterData({
        userOperation: userOp,
      });
      console.log(
        "pm_getPaymasterData result --------------------------",
        result
      );
      return res.json({ result });
    }
    return res.json({ error: "Method not found" });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// const options = {
//   key: fs.readFileSync(path.join(__dirname, "key.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
// };

// https.createServer(options, app).listen(PORT, () => {
//   console.log(`HTTPS Server is running on ${PORT}`);
// });
