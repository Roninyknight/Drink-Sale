Page({
  data: {
    goodsList: [],
    keyword: '',
    pageNum: 1,
    pageSize: 20,
    loading: false,
    hasMore: true,
  },

  onLoad() {
    this.loadGoodsList(true);
  },

  onShow() {
    this.loadGoodsList(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadGoodsList(false);
    }
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadGoodsList(true);
  },

  loadGoodsList(fresh) {
    if (fresh) {
      this.setData({ pageNum: 1, hasMore: true, goodsList: [] });
    }
    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'goods',
      data: {
        action: 'list',
        params: {
          pageNum: fresh ? 1 : this.data.pageNum,
          pageSize: this.data.pageSize,
        },
      },
    }).then((res) => {
      const { spuList, totalCount } = res.result;
      const goodsList = fresh ? spuList : this.data.goodsList.concat(spuList);
      this.setData({
        goodsList,
        pageNum: this.data.pageNum + 1,
        hasMore: goodsList.length < totalCount,
        loading: false,
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  onAddGoods() {
    wx.navigateTo({ url: '/pages/admin/goods-edit/index' });
  },

  onEditGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/admin/goods-edit/index?id=${id}` });
  },

  onDeleteGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要下架该商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'goods',
            data: { action: 'delete', params: { _id: id } },
          }).then(() => {
            wx.showToast({ title: '已下架' });
            this.loadGoodsList(true);
          });
        }
      },
    });
  },

  onToggleSale(e) {
    const { id, sale } = e.currentTarget.dataset;
    wx.cloud.callFunction({
      name: 'goods',
      data: {
        action: 'update',
        params: { _id: id, isOnSale: !sale },
      },
    }).then(() => {
      wx.showToast({ title: sale ? '已下架' : '已上架' });
      this.loadGoodsList(true);
    });
  },

  onManageCategories() {
    wx.navigateTo({ url: '/pages/admin/category-manage/index' });
  },
});
