const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const ADMIN_OPENIDS = [];

function isAdmin(openid) {
  return ADMIN_OPENIDS.includes(openid);
}

async function listCategories() {
  const res = await db.collection('categories')
    .where({ isOnSale: true })
    .orderBy('sort', 'asc')
    .get();
  return res.data;
}

async function createCategory(openid, params = {}) {
  if (!isAdmin(openid)) {
    return { success: false, message: '无权限操作' };
  }
  const { name, thumbnail, sort, level, parentId } = params;
  if (!name) {
    return { success: false, message: '分类名称不能为空' };
  }
  const categoryId = 'CAT' + Date.now();
  const now = db.serverDate();
  await db.collection('categories').add({
    data: {
      name,
      thumbnail: thumbnail || '',
      sort: sort || 0,
      level: level || 1,
      parentId: parentId || '',
      categoryId,
      isOnSale: true,
      createdAt: now,
      updatedAt: now,
    },
  });
  return { success: true, categoryId };
}

async function updateCategory(openid, params = {}) {
  if (!isAdmin(openid)) {
    return { success: false, message: '无权限操作' };
  }
  const { _id, name, thumbnail, sort, level, parentId, isOnSale } = params;
  if (!_id) {
    return { success: false, message: '缺少分类ID' };
  }
  const updateData = { updatedAt: db.serverDate() };
  if (name !== undefined) updateData.name = name;
  if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
  if (sort !== undefined) updateData.sort = sort;
  if (level !== undefined) updateData.level = level;
  if (parentId !== undefined) updateData.parentId = parentId;
  if (isOnSale !== undefined) updateData.isOnSale = isOnSale;
  await db.collection('categories').doc(_id).update({ data: updateData });
  return { success: true };
}

async function deleteCategory(openid, params = {}) {
  if (!isAdmin(openid)) {
    return { success: false, message: '无权限操作' };
  }
  if (!params._id) {
    return { success: false, message: '缺少分类ID' };
  }
  await db.collection('categories').doc(params._id).update({
    data: { isOnSale: false, updatedAt: db.serverDate() },
  });
  return { success: true };
}

exports.main = async (event) => {
  const { action, params } = event;
  const { OPENID } = cloud.getWXContext();

  try {
    switch (action) {
      case 'list': return await listCategories();
      case 'create': return await createCategory(OPENID, params);
      case 'update': return await updateCategory(OPENID, params);
      case 'delete': return await deleteCategory(OPENID, params);
      default: return { success: false, message: '未知操作' };
    }
  } catch (err) {
    return { success: false, message: err.message || '服务器错误' };
  }
};
