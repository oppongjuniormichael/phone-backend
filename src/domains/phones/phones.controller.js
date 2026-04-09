const { prisma } = require("../../lib/prisma");

function normalizePhone(phone) {
  return {
    ...phone,
    tags: phone.tags || "",
    specs: phone.specs || [],
    images: phone.images || [],
  };
}

function parseLimit(value, fallback = 20) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 100);
}

function buildWhere(query) {
  const where = {};

  if (query.status && query.status !== "all") {
    where.status = query.status;
  } else if (query.status !== "all") {
    where.status = "Published";
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.featured === "true") {
    where.isFeatured = true;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { brand: { contains: query.search, mode: "insensitive" } },
      { model: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case "createdAt_desc":
      return [{ createdAt: "desc" }];
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }
}

async function listPhones(req, res) {
  const limit = parseLimit(req.query.limit, 20);
  const where = buildWhere(req.query);
  const orderBy = buildOrderBy(req.query.sort);

  const [phones, total] = await Promise.all([
    prisma.phone.findMany({
      where,
      include: { specs: true, images: true },
      orderBy,
      take: limit,
    }),
    prisma.phone.count({ where }),
  ]);

  return res.json({ phones: phones.map(normalizePhone), total, page: 1, limit });
}

async function getPhone(req, res) {
  const phone = await prisma.phone.findUnique({
    where: { id: req.params.id },
    include: { specs: true, images: true },
  });

  if (!phone) {
    return res.status(404).json({ error: "Phone not found" });
  }

  return res.json({ phone: normalizePhone(phone) });
}

async function createPhone(req, res) {
  const payload = req.body || {};
  const specs = Array.isArray(payload.specs) ? payload.specs : [];
  const images = Array.isArray(payload.images) ? payload.images : [];
  const tags = Array.isArray(payload.tags) ? payload.tags.join(", ") : (payload.tags || "");

  const phone = await prisma.phone.create({
    data: {
      title: payload.title || "",
      brand: payload.brand || "",
      model: payload.model || "",
      condition: payload.condition || "New",
      price: Number(payload.price || 0),
      stockQty: Number(payload.stockQty || 0),
      sku: payload.sku || "",
      category: payload.category || "",
      tags,
      description: payload.description || "",
      isFeatured: Boolean(payload.isFeatured),
      isPremium: Boolean(payload.isPremium),
      warranty: payload.warranty || "",
      status: payload.status || "Draft",
      specs: {
        create: specs
          .filter((spec) => spec?.name && spec?.value)
          .map((spec) => ({ name: spec.name, value: spec.value })),
      },
      images: {
        create: images
          .filter((image) => image?.url)
          .map((image, index) => ({
            url: image.url,
            isCover: Boolean(image.isCover ?? index === 0),
            order: Number.isInteger(image.order) ? image.order : index,
          })),
      },
    },
    include: { specs: true, images: true },
  });

  return res.status(201).json({ phone: normalizePhone(phone) });
}

async function updatePhone(req, res) {
  const payload = req.body || {};
  const phoneId = req.params.id;

  const phone = await prisma.phone.update({
    where: { id: phoneId },
    data: {
      title: payload.title,
      brand: payload.brand,
      model: payload.model,
      condition: payload.condition,
      price: payload.price === undefined ? undefined : Number(payload.price),
      stockQty: payload.stockQty === undefined ? undefined : Number(payload.stockQty),
      sku: payload.sku,
      category: payload.category,
      tags: Array.isArray(payload.tags) ? payload.tags.join(", ") : payload.tags,
      description: payload.description,
      isFeatured: payload.isFeatured === undefined ? undefined : Boolean(payload.isFeatured),
      isPremium: payload.isPremium === undefined ? undefined : Boolean(payload.isPremium),
      warranty: payload.warranty,
      status: payload.status,
    },
    include: { specs: true, images: true },
  });

  return res.json({ phone: normalizePhone(phone) });
}

async function deletePhone(req, res) {
  await prisma.phone.delete({ where: { id: req.params.id } });
  return res.json({ ok: true });
}

module.exports = {
  listPhones,
  getPhone,
  createPhone,
  updatePhone,
  deletePhone,
  normalizePhone,
};
