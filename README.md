# 酒水销售小程序

一款基于微信小程序的酒水在线销售平台，采用微信云开发架构，支持商品浏览、购物车、订单管理、售后等完整电商流程，并提供后台管理功能。

## 项目概述

本项目基于 TDesign 小程序组件库搭建，面向酒水零售场景，涵盖白酒、红酒、洋酒、饮料四大品类。采用 Mock 数据与云数据库双模式，可快速切换开发和生产环境。

### 核心功能

- **商品展示**：首页轮播推荐、分类浏览、关键词搜索、商品详情
- **购物车**：商品加购、数量调整、库存校验、店铺分组
- **订单流程**：结算确认、优惠券、收货地址、支付结果、订单列表
- **售后服务**：申请退款/退货、售后进度跟踪、物流信息
- **用户中心**：个人信息管理、收货地址、订单状态快捷入口
- **后台管理**：商品增删改查、分类管理、上下架控制（基于 OpenID 权限）

## 技术栈

| 类别 | 技术方案 |
|------|----------|
| 平台 | 微信小程序 |
| 语言 | JavaScript (ES6+) |
| UI 组件库 | TDesign MiniProgram v1.9.5 |
| 后端 | 微信云开发 (wx-server-sdk ~2.6.3) |
| 数据库 | 微信云数据库 |
| 存储 | 微信云存储 |
| 日期处理 | dayjs v1.9.3 |
| 代码规范 | ESLint + Prettier + Husky + commitlint |

## 项目结构

```
酒水小程序/
├── app.js                    # 应用入口，初始化云环境
├── app.json                  # 应用配置，页面路由、分包、tabBar
├── app.wxss                  # 全局样式
├── cloudfunctions/           # 云函数
│   ├── goods/                # 商品 CRUD 云函数
│   ├── categories/           # 分类 CRUD 云函数
│   └── checkAdmin/           # 管理员权限校验
├── components/               # 全局公共组件
│   ├── goods-card/           # 商品卡片
│   ├── goods-list/           # 商品列表
│   ├── filter/               # 筛选组件
│   ├── price/                # 价格展示
│   └── ...
├── config/                   # 配置文件
│   └── index.js              # useMock 开关、管理员白名单、CDN 地址
├── custom-tab-bar/           # 自定义底部导航栏
├── model/                    # Mock 数据模型
│   ├── good.js               # 商品数据
│   ├── category.js           # 分类数据（白酒/红酒/洋酒/饮料）
│   ├── cart.js               # 购物车数据
│   ├── order/                # 订单相关数据
│   └── ...
├── pages/
│   ├── home/                 # 首页（轮播、Tab 分类、商品列表）
│   ├── category/             # 分类页（侧边栏二级分类）
│   ├── cart/                 # 购物车页
│   ├── usercenter/           # 个人中心
│   ├── goods/                # 商品子包（列表、详情、搜索、评论）
│   ├── order/                # 订单子包（确认、列表、详情、售后）
│   ├── coupon/               # 优惠券子包
│   ├── promotion/            # 营销活动子包
│   ├── user/                 # 用户信息子包
│   └── admin/                # 后台管理子包（商品管理、分类管理）
├── services/                 # 数据服务层（Mock/云函数切换）
├── style/                    # 全局样式变量
└── utils/                    # 工具函数
```

## 数据模式

项目支持两种数据模式，通过 `config/index.js` 中的 `useMock` 字段切换：

### Mock 模式（开发默认）

```javascript
// config/index.js
export const config = {
  useMock: true,  // 使用本地 mock 数据
};
```

使用 `model/` 目录下的静态数据，无需云环境即可运行，适合本地开发调试。

### 云数据库模式

```javascript
export const config = {
  useMock: false,  // 使用云数据库
};
```

通过云函数访问微信云数据库，需要在微信开发者工具中配置云环境并创建以下集合：

| 集合名 | 用途 | 说明 |
|--------|------|------|
| `goods` | 商品数据 | 包含标题、价格、图片、库存、分类等字段 |
| `categories` | 分类数据 | 支持两级分类，通过 parentId 关联 |

## 云函数说明

### goods（商品管理）

| 方法 | 权限 | 说明 |
|------|------|------|
| `list` | 公开 | 分页获取商品列表，支持按分类筛选 |
| `detail` | 公开 | 根据 spuId 获取商品详情 |
| `search` | 公开 | 关键词搜索商品（正则匹配标题） |
| `create` | 管理员 | 创建商品，自动生成 spuId |
| `update` | 管理员 | 更新商品信息（白名单字段） |
| `delete` | 管理员 | 软删除商品（设置 isOnSale: false） |

### categories（分类管理）

| 方法 | 权限 | 说明 |
|------|------|------|
| `list` | 公开 | 获取在售分类列表 |
| `create` | 管理员 | 创建分类，支持父子层级 |
| `update` | 管理员 | 更新分类信息 |
| `delete` | 管理员 | 软删除分类 |

### checkAdmin（权限校验）

校验当前用户 OPENID 是否在管理员白名单中，返回 `{ isAdmin: true/false }`。

## 管理员配置

后台管理功能通过 OpenID 白名单控制访问权限。需要在以下三个云函数中配置 `ADMIN_OPENIDS` 数组：

- `cloudfunctions/goods/index.js`
- `cloudfunctions/categories/index.js`
- `cloudfunctions/checkAdmin/index.js`

```javascript
const ADMIN_OPENIDS = [
  'your-openid-here',  // 替换为实际的管理员 OpenID
];
```

获取 OpenID 的方式：在微信开发者工具中调用 `wx.cloud.callFunction({ name: 'checkAdmin' })`，从返回结果中获取当前用户的 OPENID。

## 商品分类

当前商品分为四大品类：

| 分类 | 子分类 |
|------|--------|
| 白酒 | 酱香型、浓香型、清香型、米香型、其他香型 |
| 红酒 | 干红葡萄酒、干白葡萄酒、桃红葡萄酒、起泡酒 |
| 洋酒 | 威士忌、白兰地、伏特加、朗姆酒、金酒 |
| 饮料 | 碳酸饮料、果汁饮料、茶饮料、功能饮料 |

## 页面路由

### 主包（Tab 页面）

| Tab | 路径 | 说明 |
|-----|------|------|
| 首页 | `pages/home/home` | 轮播推荐、Tab 分类、商品列表 |
| 分类 | `pages/category/index` | 侧边栏二级分类浏览 |
| 购物车 | `pages/cart/index` | 购物车管理 |
| 我的 | `pages/usercenter/index` | 个人中心、订单入口、后台管理 |

### 分包

| 分包 | 页面 | 说明 |
|------|------|------|
| 商品 | `pages/goods/list` | 商品列表 |
| | `pages/goods/details` | 商品详情 |
| | `pages/goods/search` | 搜索 |
| | `pages/goods/comments` | 评论列表 |
| 订单 | `pages/order/order-confirm` | 结算确认 |
| | `pages/order/order-list` | 订单列表 |
| | `pages/order/order-detail` | 订单详情 |
| | `pages/order/apply-service` | 申请售后 |
| 优惠券 | `pages/coupon/coupon-list` | 优惠券列表 |
| 用户 | `pages/user/person-info` | 个人信息 |
| | `pages/user/address/list` | 收货地址 |
| 管理 | `pages/admin/goods-list` | 商品管理 |
| | `pages/admin/goods-edit` | 商品编辑 |
| | `pages/admin/category-manage` | 分类管理 |

## 快速开始

### 环境要求

- 微信开发者工具 (最新稳定版)
- Node.js (用于 npm 依赖管理)

### 运行步骤

1. 克隆项目到本地

```bash
git clone <repository-url>
```

2. 安装依赖

```bash
npm install
```

3. 配置本地环境

   复制配置模板文件并填入你自己的值：

   ```bash
   cp project.config.json.example project.config.json
   cp config/env.example.js config/env.js
   ```

   - `project.config.json`：填入你的微信小程序 AppID
   - `config/env.js`：填入你的云环境 ID（如需使用云开发）

4. 在微信开发者工具中导入项目

   - 选择项目根目录
   - 填写 AppID：`请填入你的AppID`

5. 构建 npm

   - 在开发者工具中点击 "工具" -> "构建 npm"

6. 配置云环境（可选，使用云数据库时需要）

   - 在开发者工具中点击 "云开发" 开通云环境
   - 云环境 ID：`请填入你的云环境ID`
   - 创建 `goods` 和 `categories` 数据集合

7. 编译运行

   - 点击 "编译" 按钮即可预览

## 代码规范

项目使用 ESLint + Prettier 进行代码风格控制，提交代码时会通过 Husky + lint-staged 自动检查。

提交信息规范遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
```

## 基础库版本

- 最低基础库版本：`^2.6.5`
- 推荐基础库版本：`3.13.0`

## 开源协议

本项目基于 [MIT 协议](LICENSE) 开源。
