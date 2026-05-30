Page({
  data: {
    categoryList: [],
    showModal: false,
    isEdit: false,
    editId: '',
    editName: '',
    editThumbnail: '',
    editSort: 0,
    editLevel: 1,
    editParentId: '',
  },

  onLoad() {
    this.loadCategories();
  },

  onShow() {
    this.loadCategories();
  },

  loadCategories() {
    wx.cloud.callFunction({
      name: 'categories',
      data: { action: 'list' },
    }).then((res) => {
      this.setData({ categoryList: res.result });
    });
  },

  onAddCategory() {
    this.setData({
      showModal: true,
      isEdit: false,
      editId: '',
      editName: '',
      editThumbnail: '',
      editSort: 0,
      editLevel: 1,
      editParentId: '',
    });
  },

  onAddSubCategory(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      showModal: true,
      isEdit: false,
      editId: '',
      editName: '',
      editThumbnail: '',
      editSort: 0,
      editLevel: 2,
      editParentId: id,
    });
  },

  onEditCategory(e) {
    const { id } = e.currentTarget.dataset;
    const cat = this.data.categoryList.find((c) => c._id === id);
    if (cat) {
      this.setData({
        showModal: true,
        isEdit: true,
        editId: cat._id,
        editName: cat.name,
        editThumbnail: cat.thumbnail || '',
        editSort: cat.sort || 0,
        editLevel: cat.level,
        editParentId: cat.parentId || '',
      });
    }
  },

  onDeleteCategory(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该分类吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'categories',
            data: { action: 'delete', params: { _id: id } },
          }).then(() => {
            wx.showToast({ title: '已删除' });
            this.loadCategories();
          });
        }
      },
    });
  },

  onCloseModal() {
    this.setData({ showModal: false });
  },

  onInputName(e) {
    this.setData({ editName: e.detail.value });
  },

  onInputSort(e) {
    this.setData({ editSort: e.detail.value });
  },

  onChooseThumbnail() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const ext = res.tempFilePaths[0].split('.').pop();
        const cloudPath = 'categories/' + Date.now() + '.' + ext;
        wx.cloud.uploadFile({
          cloudPath,
          filePath: res.tempFilePaths[0],
        }).then((uploadRes) => {
          this.setData({ editThumbnail: uploadRes.fileID });
        });
      },
    });
  },

  onSaveCategory() {
    if (!this.data.editName) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' });
      return;
    }

    const params = {
      name: this.data.editName,
      thumbnail: this.data.editThumbnail,
      sort: parseInt(this.data.editSort) || 0,
      level: this.data.editLevel,
      parentId: this.data.editParentId,
    };

    const action = this.data.isEdit ? 'update' : 'create';
    if (this.data.isEdit) {
      params._id = this.data.editId;
    }

    wx.cloud.callFunction({
      name: 'categories',
      data: { action, params },
    }).then((res) => {
      if (res.result.success) {
        wx.showToast({ title: this.data.isEdit ? '修改成功' : '添加成功' });
        this.setData({ showModal: false });
        this.loadCategories();
      } else {
        wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
      }
    });
  },

  getSubCategories(parentId) {
    return this.data.categoryList.filter((c) => c.parentId === parentId);
  },
});
