module.exports = async (req, res) => {
  const { unit = "days", market = "KRW-BTC", count = "200" } = req.query || {};

  if (!["days", "weeks", "months"].includes(unit) || !/^KRW-[A-Z0-9]{2,10}$/.test(market)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const n = Math.min(Math.max(parseInt(count, 10) || 200, 1), 200);

  try {
    const upstream = await fetch(
      `https://api.upbit.com/v1/candles/${unit}?market=${market}&count=${n}`,
      { headers: { accept: "application/json" } }
    );
    const body = await upstream.text();
    if (upstream.ok) {
      res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=60");
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(upstream.status).send(body);
  } catch (e) {
    res.status(502).json({ error: "업비트 서버에 연결하지 못했습니다." });
  }
};
