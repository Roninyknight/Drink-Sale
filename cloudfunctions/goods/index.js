const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const ADMIN_OPENIDS = []; // 请在云环境中配置管理员openid

async function isAdmin(openid) {
  return ADMIN_OPENIDS.includes(openid);
}

async function listGoods(params) {
  const { pageNum = 1, pageSize = 20, categoryId } = params;
  const skip = (pageNum - 1) * pageSize;
  const where = { isOnSale: true };
  if (categoryId) {
    where.categoryId = categoryId;
  }
  const [listRes, countRes] = await Promise.all([
    db.collection('goods')
      .where(where)
      .orderBy('sort', 'asc')
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get(),
    db.collection('goods').where(where).count(),
  ]);
  return {
    spuList: listRes.data,
    totalCount: countRes.total,
    pageNum,
    pageSize,
  };
}

async function getGoodDetail(params) {
  const { spuId } = params;
  const res = await db.collection('goods').where({ spuId }).get();
  if (res.data.length === 0) {
    return { success: false, message: '商品不存在' };
  }
  return res.data[0];
}

async function searchGoods(params) {
  const { keyword, pageNum = 1, pageSize = 20 } = params;
  const skip = (pageNum - 1) * pageSize;
  const _ = db.command;
  const where = {
    isOnSale: true,
    title: db.RegExp({ regexp: keyword, options: 'i' }),
  };
  const [listRes, countRes] = await Promise.all([
    db.collection('goods')
      .where(where)
      .skip(skip)
      .limit(pageSize)
      .get(),
    db.collection('goods').where(where).count(),
  ]);
  return {
    spuList: listRes.data,
    totalCount: countRes.total,
  };
}

async function createGood(openid, params) {
  if (!(await isAdmin(openid))) {
    return { success: false, message: '无权限操作' };
  }
  const spuId = 'GOOD' + Date.now();
  const now = db.serverDate();
  const res = await db.collection('goods').add({
    data: {
      ...params,
      spuId,
      soldNum: 0,
      isOnSale: params.isOnSale !== false,
      createdAt: now,
      updatedAt: now,
    },
  });
  return { success: true, _id: res._id, spuId };
}

async function updateGood(openid, params) {
  if (!(await isAdmin(openid))) {
    return { success: false, message: '无权限操作' };
  }
  const { _id, ...updateData } = params;
  updateData.updatedAt = db.serverDate();
  await db.collection('goods').doc(_id).update({ data: updateData });
  return { success: true };
}

async function deleteGood(openid, params) {
  if (!(await isAdmin(openid))) {
    return { success: false, message: '无权限操作' };
  }
  await db.collection('goods').doc(params._id).update({
    data: { isOnSale: false, updatedAt: db.serverDate() },
  });
  return { success: true };
}

exports.main = async (event) => {
  const { action, params } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'list': return await listGoods(params);
    case 'detail': return await getGoodDetail(params);
    case 'search': return await searchGoods(params);
    case 'create': return await createGood(OPENID, params);
    case 'update': return await updateGood(OPENID, params);
    case 'delete': return await deleteGood(OPENID, params);
    default: return { success: false, message: '未知操作' };
  }
};
