Page({
  data: {
    isEdit: false,
    editId: '',
    title: '',
    categoryId: '',
    categoryName: '',
    categoryList: [],
    categoryIndex: -1,
    minSalePrice: '',
    maxSalePrice: '',
    minLinePrice: '',
    maxLinePrice: '',
    stock: '',
    primaryImage: '',
    images: [],
    descImages: [],
    isOnSale: true,
    submitting: false,
  },

  onLoad(query) {
    this.loadCategories();
    if (query.id) {
      this.setData({ isEdit: true, editId: query.id });
      this.loadGoodsDetail(query.id);
    }
  },

  loadCategories() {
    wx.cloud.callFunction({
      name: 'categories',
      data: { action: 'list' },
    }).then((res) => {
      this.setData({ categoryList: res.result });
    });
  },

  loadGoodsDetail(id) {
    wx.cloud.callFunction({
      name: 'goods',
      data: { action: 'detail', params: { _id: id } },
    }).then((res) => {
      const d = res.result;
      this.setData({
        title: d.title,
        categoryId: d.categoryId,
        categoryName: d.categoryName,
        minSalePrice: d.minSalePrice ? String(d.minSalePrice / 100) : '',
        maxSalePrice: d.maxSalePrice ? String(d.maxSalePrice / 100) : '',
        minLinePrice: d.minLinePrice ? String(d.minLinePrice / 100) : '',
        maxLinePrice: d.maxLinePrice ? String(d.maxLinePrice / 100) : '',
        stock: d.stock ? String(d.stock) : '',
        primaryImage: d.primaryImage || '',
        images: d.images || [],
        descImages: d.descImages || [],
        isOnSale: d.isOnSale !== false,
      });
    });
  },

  onInputTitle(e) { this.setData({ title: e.detail.value }); },
  onInputMinPrice(e) { this.setData({ minSalePrice: e.detail.value }); },
  onInputMaxPrice(e) { this.setData({ maxSalePrice: e.detail.value }); },
  onInputMinLine(e) { this.setData({ minLinePrice: e.detail.value }); },
  onInputMaxLine(e) { this.setData({ maxLinePrice: e.detail.value }); },
  onInputStock(e) { this.setData({ stock: e.detail.value }); },

  onCategoryChange(e) {
    const idx = e.detail.value;
    const cat = this.data.categoryList[idx];
    this.setData({
      categoryIndex: idx,
      categoryId: cat.categoryId,
      categoryName: cat.name,
    });
  },

  onToggleSale() {
    this.setData({ isOnSale: !this.data.isOnSale });
  },

  onChoosePrimaryImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImage(res.tempFilePaths[0]).then((fileID) => {
          this.setData({ primaryImage: fileID });
        });
      },
    });
  },

  onChooseImages() {
    const remaining = 9 - this.data.images.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传9张', icon: 'none' });
      return;
    }
    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        Promise.all(res.tempFilePaths.map((p) => this.uploadImage(p))).then((fileIDs) => {
          this.setData({ images: this.data.images.concat(fileIDs) });
        });
      },
    });
  },

  onRemoveImage(e) {
    const idx = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(idx, 1);
    this.setData({ images });
  },

  onChooseDescImages() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        Promise.all(res.tempFilePaths.map((p) => this.uploadImage(p))).then((fileIDs) => {
          this.setData({ descImages: this.data.descImages.concat(fileIDs) });
        });
      },
    });
  },

  onRemoveDescImage(e) {
    const idx = e.currentTarget.dataset.index;
    const descImages = this.data.descImages;
    descImages.splice(idx, 1);
    this.setData({ descImages });
  },

  uploadImage(filePath) {
    const ext = filePath.split('.').pop();
    const cloudPath = 'goods/' + Date.now() + '_' + Math.random().toString(36).substr(2) + '.' + ext;
    return wx.cloud.uploadFile({ cloudPath, filePath }).then((res) => res.fileID);
  },

  onSubmit() {
    if (!this.data.title) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }
    if (!this.data.minSalePrice) {
      wx.showToast({ title: '请输入售价', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const params = {
      title: this.data.title,
      categoryId: this.data.categoryId,
      categoryName: this.data.categoryName,
      minSalePrice: Math.round(parseFloat(this.data.minSalePrice) * 100),
      maxSalePrice: this.data.maxSalePrice ? Math.round(parseFloat(this.data.maxSalePrice) * 100) : null,
      minLinePrice: this.data.minLinePrice ? Math.round(parseFloat(this.data.minLinePrice) * 100) : null,
      maxLinePrice: this.data.maxLinePrice ? Math.round(parseFloat(this.data.maxLinePrice) * 100) : null,
      stock: parseInt(this.data.stock) || 0,
      primaryImage: this.data.primaryImage,
      images: this.data.images,
      descImages: this.data.descImages,
      isOnSale: this.data.isOnSale,
    };

    const action = this.data.isEdit ? 'update' : 'create';
    if (this.data.isEdit) {
      params._id = this.data.editId;
    }

    wx.cloud.callFunction({
      name: 'goods',
      data: { action, params },
    }).then((res) => {
      this.setData({ submitting: false });
      if (res.result.success) {
        wx.showToast({ title: this.data.isEdit ? '修改成功' : '添加成功' });
        setTimeout(() => wx.navigateBack(), 1000);
      } else {
        wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
      }
    }).catch(() => {
      this.setData({ submitting: false });
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  },
});
