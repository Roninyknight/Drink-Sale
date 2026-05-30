const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const ADMIN_OPENIDS = [];

async function isAdmin(openid) {
  return ADMIN_OPENIDS.includes(openid);
}

async function listCategories() {
  const res = await db.collection('categories')
    .where({ isOnSale: true })
    .orderBy('sort', 'asc')
    .get();
  return res.data;
}

async function createCategory(openid, params) {
  if (!(await isAdmin(openid))) {
    return { success: false, message: '无权限操作' };
  }
  const categoryId = 'CAT' + Date.now();
  const now = db.serverDate();
  await db.collection('categories').add({
    data: {
      ...params,
      categoryId,
      isOnSale: true,
      createdAt: now,
      updatedAt: now,
    },
  });
  return { success: true, categoryId };
}

async function updateCategory(openid, params) {
  if (!(await isAdmin(openid))) {
    return { success: false, message: '无权限操作' };
  }
  const { _id, ...updateData } = params;
  updateData.updatedAt = db.serverDate();
  await db.collection('categories').doc(_id).update({ data: updateData });
  return { success: true };
}

async function deleteCategory(openid, params) {
  if (!(await isAdmin(openid))) {
    return { success: false, message: '无权限操作' };
  }
  await db.collection('categories').doc(params._id).update({
    data: { isOnSale: false, updatedAt: db.serverDate() },
  });
  return { success: true };
}

exports.main = async (event) => {
  const { action, params } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'list': return await listCategories();
    case 'create': return await createCategory(OPENID, params);
    case 'update': return await updateCategory(OPENID, params);
    case 'delete': return await deleteCategory(OPENID, params);
    default: return { success: false, message: '未知操作' };
  }
};
