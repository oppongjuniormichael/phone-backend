 const { prisma } = require("../../lib/prisma");

async function getStats(_req, res) {
  const [totalPhones, totalStock, lowStock, outOfStock, published, drafts, recentActivity] = await Promise.all([
    prisma.phone.count(),
    prisma.phone.aggregate({ _sum: { stockQty: true } }),
    prisma.phone.count({ where: { stockQty: { lte: 5, gt: 0 } } }),
    prisma.phone.count({ where: { stockQty: { lte: 0 } } }),
    prisma.phone.count({ where: { status: "Published" } }),
    prisma.phone.count({ where: { status: "Draft" } }),
    prisma.stockActivity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { phone: { select: { id: true, title: true, brand: true } } },
    }),
  ]);

  return res.json({
    totalPhones,
    totalStock: totalStock._sum.stockQty || 0,
    lowStock,
    outOfStock,
    published,
    drafts,
    recentActivity,
  });
}

async function adjustStock(req, res) {
  const delta = Number(req.body?.delta || 0);
  const reason = req.body?.reason || "Stock adjusted";

  if (Number.isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: "A non-zero delta is required" });
  }

  const phone = await prisma.phone.update({
    where: { id: req.params.id },
    data: { stockQty: { increment: delta } },
  });

  await prisma.stockActivity.create({
    data: {
      phoneId: phone.id,
      delta,
      reason,
    },
  });

  return res.json({ phone });
}

module.exports = { getStats, adjustStock };
