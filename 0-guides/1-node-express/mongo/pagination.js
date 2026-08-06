export const users = catchAsync(async (req, res, next) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit)) || 5);
  const usersKey = `users:${page}:limit:${limit}:sort:-createdAt`;
  const totalKey = "user:total";

  let users = await redisClient.get(usersKey);
  let total = await redisClient.get(totalKey);

  if (users) {
    users = JSON.parse(users);
  } else {
    users = await userSC
      .find({}, { _id: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await redisClient.set(usersKey, JSON.stringify(users), "EX", 20);
  }

  if (!total) {
    total = await userSC.estimatedDocumentCount();
    await redisClient.set(totalKey, total, "EX", 120);
  }

  //or
  res.set("X-Total-Count", total);
  res.set("X-Total-Pages", Math.ceil(total / limit));
  res.set("X-Current-Page", page);
  res.set("X-Per-Page", limit);

  res.json({
    success: true,
    users
  });
});


GET http://localhost:4000/api/users?page=3&limit=10

✔ Create user
await redisClient.incr("user:total");
✔ Delete user
await redisClient.decr("user:total");
