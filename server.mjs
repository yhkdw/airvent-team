import { createServer } from "http";

const PORT = process.env.PORT || 3000;

const db = {
  proofs: [],
  rewards: [],
};

const memoIx = (hash32) => ({
  programId: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  data: Array.from(Buffer.from(hash32)).slice(0, 8),
});

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>AirVent MVP Demo</title>
<style>
body{font-family:Arial,sans-serif;background:#0b1020;color:#ecf0ff;margin:0}
main{max-width:860px;margin:0 auto;padding:40px 20px}
.card{background:#131b34;border:1px solid #29355f;border-radius:14px;padding:20px;margin-top:16px}
label{display:block;margin:10px 0 4px}
input,button{width:100%;padding:10px;border-radius:8px;border:1px solid #35457c;background:#0f1530;color:#ecf0ff}
button{background:#4f78ff;border:none;margin-top:10px;cursor:pointer;font-weight:bold}
pre{background:#0a1128;border:1px solid #25305c;border-radius:10px;padding:12px;white-space:pre-wrap}
</style>
</head>
<body>
<main>
<h1>AirVent MVP Demo</h1>
<p>데모 우선: Proof 제출 → 검증 → 보상 큐 등록</p>
<div class="card">
<h2>Proof 제출</h2>
<label>Miner</label><input id="miner" value="DemoMiner1111111111111111111111111111111111" />
<label>Hash32</label><input id="hash32" value="2f4b8e9ef8b85af5a3d6c89f52f4fd3f" />
<label>Signature</label><input id="sig" value="demo-signature" />
<button id="submit">/api/proofs POST</button>
<pre id="proofOut">-</pre>
</div>
<div class="card">
<h2>보상 조회</h2>
<button id="rewards">/api/rewards GET</button>
<pre id="rewardsOut">-</pre>
</div>
</main>
<script>
const proofOut = document.getElementById('proofOut');
const rewardsOut = document.getElementById('rewardsOut');

document.getElementById('submit').onclick = async () => {
  const body = {
    miner: document.getElementById('miner').value,
    ts: Date.now(),
    hash32: document.getElementById('hash32').value,
    sig: document.getElementById('sig').value,
  };
  const res = await fetch('/api/proofs', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  proofOut.textContent = JSON.stringify(await res.json(), null, 2);
};

document.getElementById('rewards').onclick = async () => {
  const res = await fetch('/api/rewards');
  rewardsOut.textContent = JSON.stringify(await res.json(), null, 2);
};
</script>
</body>
</html>`;

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (req.method === "POST" && req.url === "/api/proofs") {
    try {
      const body = await readJson(req);
      const { miner, ts, hash32, sig } = body;

      if (!miner || !ts || !hash32 || !sig) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, message: "miner, ts, hash32, sig are required" }));
        return;
      }

      if (String(sig).length < 6) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, message: "invalid signature (demo validation)" }));
        return;
      }

      db.proofs.push({ miner, ts, hash32, sig });
      db.rewards.push({ miner, amount: 1, status: "queued", createdAt: Date.now() });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          message: "proof accepted and reward queued",
          memoDataPreview: memoIx(String(hash32)).data,
        }),
      );
      return;
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, message: "invalid json" }));
      return;
    }
  }

  if (req.method === "GET" && req.url === "/api/rewards") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ count: db.rewards.length, rewards: db.rewards }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, message: "not found" }));
});

server.listen(PORT, () => {
  console.log(`AirVent demo running on http://localhost:${PORT}`);
});
