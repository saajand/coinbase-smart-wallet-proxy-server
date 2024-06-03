import express, { Request, Response } from "express";
import { paymasterClient } from "./config/paymasterConfig";
import { willSponsor } from "./utils/sponsor";
import cors from "cors";
import dotenv from 'dotenv';
// import https from "https";
// import fs from "fs";
// import path from "path";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 8000;
const paymasterService = process.env.PAYMASTER_SERVICE_URL;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/paym", async (req: Request, res: Response) => {
  const method = req.body.method;
  // if (!req.body?.params?.chainId) {
  //   return res.status(400).json({ error: "Missing required parameters" });
  // }
  const [userOp, entrypoint, chainId] = req.body.params;
  console.log({ userOp, entrypoint, chainId, method });

  const willSponsorCheck = await willSponsor({
    chainId: parseInt(chainId),
    entrypoint,
    userOp,
  });
  console.log("willSponsorCheck == ", willSponsorCheck);
  if (!willSponsorCheck) {
    return Response.json({ error: "Not a sponsorable operation" });
  }

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
  //   return Response.json(await fetchRes.json());
  // }
  // return Response.json({ error: "Method not found" });

  if (method === "pm_getPaymasterStubData") {
    const result = await paymasterClient.getPaymasterStubData({
      userOperation: userOp,
    });
    console.log(
      "pm_getPaymasterStubData result --------------------------",
      result
    );
    return Response.json({ result });
  } else if (method === "pm_getPaymasterData") {
    const result = await paymasterClient.getPaymasterData({
      userOperation: userOp,
    });
    console.log(
      "pm_getPaymasterData result --------------------------",
      result
    );
    return Response.json({ result });
  }
  return Response.json({ error: "Method not found" });
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
