# 实体游戏目录（Physical Game Catalog）

面向商业库存浏览的静态展示站：按发售时间陈列 PlayStation 实体光盘与 Nintendo Switch / Switch 2 卡带（约 2023-09 ～ 2026-09）。

技术栈：**Vite + 原生 JS**，纯前端，数据来自 `public/data/games.json`。

## 快速开始

```bash
cd game-catalog-site
npm install
npm run dev      # 本地预览（默认 http://localhost:5173）
npm run build    # 产出到 dist/
npm run preview  # 预览生产构建
```

## 替换 / 扩展数据

1. 按下方字段准备完整导出（JSON 数组）。
2. 覆盖文件：`public/data/games.json`。
3. 重新 `npm run build`（或开发模式下刷新即可）。

首发数据合并自：

- `../game-catalog/ps_physical_enriched.json`（PS5 实体，含封面 URL 与多版本行）
- `../game-catalog/ns_cartridge_2023-2026.csv`（NS / NS2 卡带；若日后有 NS enriched JSON 将优先使用）

同一作品的标准版 / 限定 / 典藏等保持**独立卡片**。近重复 SKU 会优先保留带封面与价格的一条。`cover_url` 为空时界面显示平台占位图——**请勿填入无法访问的 CDN 路径**。

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一 ID（可由导出提供，缺失时站点构建脚本生成） |
| `release_date` | string | 发售日 `YYYY-MM-DD` |
| `title_cn` | string | 中文标题（可空，界面回退英文） |
| `title_en` | string | 英文标题 |
| `platform` | string | `PS5` / `PS4` / `NS` / `NS2` |
| `media` | string | `disc`（光盘）或 `cartridge`（卡带） |
| `edition` | string | `standard` / `limited` / `collector` / `deluxe` / `ultimate` / `other` |
| `edition_name` | string | 版本显示名（如「典藏版」「Collector's Edition」） |
| `edition_notes` | string | 特典 / 版本说明 |
| `msrp` | number 或 null | 建议零售价；未知填 `null` |
| `currency` | string | 如 `USD` / `JPY` / `CNY`；无价格可空 |
| `region_note` | string | 区域 / 版本备注 |
| `cover_url` | string | 封面公开 URL；无则 `""` |
| `cover_source` | string | 封面来源说明（如 CDJapan / Wikimedia） |
| `source` | string | 条目数据来源 |
| `release_status` | string（可选） | `released` / `upcoming`；缺省时按 `release_date` 与当天比较推导 |

## 功能一览

- 深色游戏商店风格；Hero：「实体游戏目录」
- 按年 / 年月分组
- 筛选：平台、版本、有价格、即将发售；中英文搜索
- 未发售条目显示醒目「即将发售 / Coming soon」徽章，仍保留在时间线中
- 卡片：封面（盒装比例）、标题、平台 / 版本徽章、日期、价格
- 详情弹层：大图封面与全部字段、特典说明
- 缺封面时按平台显示占位图
- 页脚含 MSRP 参考与公开封面来源免责声明
- 移动端适配

## 免责声明

MSRP 仅为参考，不是实时售价或交易要约。封面若有，来自公开零售 / 资料来源（如 CDJapan 商品图）；演示特典说明请以官方发行为准。
