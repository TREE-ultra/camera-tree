# LUMIÈRE NOËL — 摄影器材挂饰规格研究笔记

- **文件**：`E:\依托html\camera-tree\specs.json`（21 件产品，UTF-8，已用 Node `JSON.parse` 校验通过）
- **研究/核验时间**：2026-11-21（环境时间为 2026 年 11 月）
- **约定**：`release` 一律使用**发布（announcement）年月**，不等于各市场上市月份；重量尽量采用厂商“含电池与存储卡”口径，无法确定时在字段内注明。
- **传感器尺寸**：全画幅统一 `36 × 24 mm`；中画幅统一 `43.8 × 32.9 mm`（按任务要求）。
- **像场圆（imageCircleMm）**：35mm 系统取 43.3（√(36²+24²)=43.27）；中画幅取 55（√(43.8²+32.9²)=54.77≈55）。

## 1. 研究方法与来源

主力核对源为**厂商官方新闻稿 / 官方规格页**，并以 **Neocamera 规格库**（含完整规格表，可逐项对照）交叉验证；镜头等效焦距、像场与重量再与官方口径核对。

部分厂商站点在本环境被反爬拦截（HTTP 403 / Cloudflare），因此官方来源使用了可访问的官方地区站（sony.jp、canon.com.cn、global.canon、hasselblad.com 等）；Neocamera 页面可用文本方式抓取并已逐条核对。

### 各产品主要来源

| id | 主要来源 |
| --- | --- |
| sony-a1m2 | https://www.sony.jp/ichigan/products/ILCE-1M2/spec.html · https://www.neocamera.com/camera/sony/a1ii · https://www.cameralabs.com/sony-a1-ii-review/ |
| sony-a9m3 | https://www.sony.jp/ichigan/products/ILCE-9M3/spec.html · https://www.sony.co.uk/store/product/ilce9m3b.cec/Alpha-9-III-with-global-shutter · https://www.neocamera.com/camera/sony/a9iii |
| sony-a7r6 | https://sony.mediaroom.com/2026-05-13-Sony-Electronics-Accelerates-High-Resolution-Photography-with-the-Alpha-7R-VI · https://www.sony.jp/ichigan/products/ILCE-7RM6/spec.html · https://www.neocamera.com/camera/sony/a7rvi |
| sony-zve1 | https://www.sony.jp/ichigan/products/ZV-E1/spec.html · https://www.sonystyle.com.cn/products/ilc/zv_e1/zv_e1_w.html · https://www.neocamera.com/camera/sony/zve1 |
| sony-600f4 | https://www.sony.jp/ichigan/products/SEL600F40GM/spec.html · https://www.sony.com/lr/electronics/camera-lenses/sel600f40gm/specifications · https://www.neocamera.com/lens/sony/fe_600mm_f4_gm |
| sony-400f28 | https://www.sony.jp/ichigan/products/SEL400F28GM/spec.html · https://www.sony.com.vn/electronics/ong-kinh-may-anh/sel400f28gm/specifications · https://www.neocamera.com/lens/sony/fe_400mm_f2.8_gm_oss |
| nikon-z9 | https://nij.nikon.com/products/lineup/mirrorless/z9/spec.html · https://www.neocamera.com/camera/nikon/z9 |
| nikon-z8 | https://www.nikonusa.com/p/z-8/1695 · https://www.neocamera.com/camera/nikon/z8 |
| nikon-800f63 | https://nij.nikon.com/products/lineup/nikkor/zmount/nikkor_z_800mm_f63_vr_s/spec.html · https://www.nikonusa.com/p/nikkor-z-800mm-f63-vr-s/20112/overview · https://www.neocamera.com/lens/nikkor/z_800mm_f6.3s_vr |
| nikon-d850 | https://www.nikonusa.com/p/d850/1585/overview · https://www.neocamera.com/camera/nikon/d850 |
| nikon-d6 | https://www.nikonusa.com/p/d6/1624/overview · https://www.neocamera.com/camera/nikon/d6 |
| canon-1dx3 | https://global.canon/ja/c-museum/product/dslr891.html · https://www.neocamera.com/camera/canon/1dxmarkiii |
| canon-5d4 | https://global.canon/zh/c-museum/product/dslr849.html · https://www.neocamera.com/camera/canon/5dmarkiv |
| canon-r1 | https://m.canon.com.cn/product/r1/spec.html · https://www.neocamera.com/camera/canon/r1 |
| canon-r52 | https://faq.canon.jp/app/answers/detail/a_id/104750（EOS R5 Mark II 主な仕様）· https://www.neocamera.com/camera/canon/r5markii |
| canon-ef600f4 | https://www.canon.com.cn/product/ef600f4lisiii/index.html · https://global.canon/zh/c-museum/product/ef475.html · https://www.neocamera.com/lens/canon/ef_600mm_f4l_is_iii_usm |
| canon-rf1200f8 | https://www.canon.com.au/camera-lenses/rf-1200mm-f8-l-is-usm · https://www.neocamera.com/lens/canon/rf_1200mm_f8l_is_usm |
| hasselblad-x2d2 | https://www.hasselblad.com/zh-cn/press/press-releases/2025/hasselblad-introduces-the-x2d-ii-100c-and-xcd-35-100e/ · https://www.neocamera.com/camera/hasselblad/x2dii100c |
| hasselblad-907x | https://www.hasselblad.com/zh-cn/press/press-releases/2024/hasselblad-unveils-the-907x-cfv-100c/ · https://www.captureintegration.com/the-hasselblad-907x-100c-specifications/ |
| hasselblad-xcd35100 | https://www.hasselblad.com/zh-cn/press/press-releases/2025/hasselblad-introduces-the-x2d-ii-100c-and-xcd-35-100e/ · https://www.hasselblad.com/x-system/xcd-35-100e-faq/ · https://www.neocamera.com/lens/hasselblad/xcd_35-100mm_f2.8-4e |
| fujifilm-gfx100ii | https://fujifilm-x.com/ja-jp/products/cameras/gfx100-ii/specifications/ · https://www.neocamera.com/camera/fuji/gfx100ii |

## 2. 2026 年 11 月的新品情况（重要）

- **Sony α7R VI 已正式发布**（2026-05-13 新闻稿，6 月上市，66.8MP、30fps、8K 30p、713g、美国定价 4,499.99 美元）。此前项目内草稿把它标为“未发布/传闻”，**本次已按官方资料更正**，不再是传闻数据。
- **Hasselblad X2D II 100C 与 XCD 2,8-4/35-100E 已于 2025-08-26 发布**，官方名称已核实（见下）。
- 其余 18 款产品均为在售/经典机型，未见改名或换代：
  - Nikon Z9 II：据 2025–2026 报道将推迟到 2027 年，2026 年内未发布；
  - Sony α1 III：社区预期 2027 年，未发布；
  - Canon EOS R5 Mark III / Nikon Z8 II：仅为传闻；
  - Fujifilm GFX100 III、Canon EOS R1 Mark II：尚无官方发布。
- 任务描述写“19 件产品”，但清单实际为 **21 件**（Sony 6 + Nikon 5 + Canon 6 + Hasselblad 3 + Fujifilm 1），已按 21 件交付。

## 3. 不确定项与处理方式

1. **sony-zve1（白色）**：官方存在白色机身（型号 ZV-E1/W、ZV-E1L/W，日本/中国/澳洲等市场在售）。白色配色为后续追加，**具体首发月份未能从官方渠道确证**，故 `release` 沿用 ZV-E1 系列首发 2023-03，并在 `note` 中说明。
2. **sony-a7r6**：官方新闻稿给出 66.8MP、BIONZ XR2、30fps、8.5 档防抖、9.44M EVF、NP-SA100、8K 120 分钟等；**重量 713g 取自 Neocamera 规格表**（新闻稿未逐项列出），`note` 已标注。
3. **sony-a9m3**：重量采用官方“含电池与存储卡”702g；部分数据库给 678g（机身净重）或 617g，均未采用。
4. **canon-r52**：ISO 采用佳能官方口径 **100–51200（扩展 50–102400）**；Neocamera 表中写 100–102400，与官方不符，已按官方修正。
5. **canon-r1 / canon-r52**：发布为 2024-07，R1 实际上市为 2024-11；`release` 统一用发布月。
6. **nikon-800f63**：滤镜口径 **95mm**（前置螺纹），部分数据库该栏为空/有误；最近对焦官方为 **5 m**（Neocamera 显示 50cm 系单位笔误）。已按官方。
7. **hasselblad-x2d2**：官方名称即 **X2D II 100C**（“II”为罗马数字）。ISO 50–25600、最快约 3 fps、425 点相位 + LIDAR、840g，**不支持视频录制**（许多二手资料仍误写 4K 视频）。
8. **hasselblad-907x**：官方套装名 **907X & CFV 100C**；CFV 100C 460g + 907X 160g = 约 620g（**不含电池与存储卡**），与机身类目其他条目的重量口径不同，`note` 已说明。ISO 64–25600、3.3 fps、294 区 PDAF+CDAF、**不支持视频录制**（非摄像机背）。
9. **hasselblad-xcd35100**：官方型号写作 **XCD 2,8-4/35-100E**（哈苏惯用“光圈/焦距”写法），常见叫法为 XCD 35-100mm f/2.8-4 E；规格 86mm 滤镜、0.4 m 最近对焦、0.25×、90 × 133 mm、894g、镜间快门 1/4000s；等效全画幅 28–80mm（0.8× 裁切）。
10. **像场圆**按任务要求取整（43.3 / 55），非厂商公布值，仅用于挂饰可视化。
11. 部分厂商页面（sony.com、nikonusa.com、usa.canon.com、fujifilm-x.com、dpreview、B&H 等）在本环境返回 403/Cloudflare，**未能直接读取**；因此官方来源改用可访问的官方地区站，并用 Neocamera 交叉核对。

## 4. 与现有 `camera-tree/specs.js` 草稿的差异（供 Lead / 前端核对）

草稿 `specs.js` 由早期研究生成，存在以下需替换项（以 `specs.json` 为准）：

| id | 草稿 | 更正 |
| --- | --- | --- |
| sony-a7r6 | 标为“传闻”，67MP、10fps、约 690g | 官方 66.8MP、30fps、713g、2026-05 发布 |
| sony-a9m3 | 678 g | 702g（含电池与存储卡） |
| sony-600f4 | 2,870 g、163.6×449 | 3040g、163.6×449 mm（重量更正） |
| nikon-800f63 | 滤镜 46 mm 插入式 | 95 mm 前置螺纹 |
| nikon-z9 | 2021.12 | 2021-10（发布月） |
| nikon-d6 | 1,270 g“含电池” | 1450g（含电池与存储卡） |
| canon-r1 | 920 g | 1115g（含电池与存储卡） |
| canon-r52 | 656 g | 746g（含电池与存储卡）；ISO 官方 100–51200 |
| canon-rf1200f8 | 168×344 mm、2022.05 | 168×537 mm、2022-02 |
| hasselblad-x2d2 | 1,060 g、4K 30p、ISO 64–25600 | 840g、无视频、ISO 50–25600、3 fps |
| hasselblad-907x | 有 2.7K 视频、约 1,000 g | 无视频、约 620g（不含电池） |
| hasselblad-xcd35100 | 约 1,220 g、约 92×143 mm、2025.06、等效 28–76mm | 894g、90×133 mm、2025-08、等效 28–80mm |
| 全部 | `sensorFormat`: "35mm Full Frame"、`release`: "2024.11" | `specs.json` 用 "Full Frame"/"Medium Format"、`release` 用 "2024-11"；已额外提供 `megapixelsMP`、`sensorW`、`sensorH` 便于前端沿用旧渲染逻辑 |

## 5. JSON 结构说明

`specs.json` 顶层：`generated` / `verifiedOn` / `collection` / `products[21]`。

- 相机条目字段：`id, brand, name, fullName, category, mount, sensorFormat, sensorDims, sensorW, sensorH, sensorType, megapixels`（像素总数，数值）+ `megapixelsMP`（百万像素，供 UI 显示）, `iso, burst, video, af, weight, dimensions, release, accent, tagline, highlights[], sources[]`，必要处附加 `note`。
- 镜头条目字段：`id, brand, name, fullName, category, mount, sensorFormat, sensorDims("—"), focal, maxAperture, minAperture, formatCoverage, minFocus, filter, dimensions, weight, release, imageCircleMm, accent, tagline, highlights[], sources[]`，必要处附加 `note`。
- `accent` 按品牌：Sony `#ff6a00`、Nikon `#ffd400`、Canon `#e60000`、Hasselblad `#c8a45d`、Fujifilm `#00a651`。
- 校验结果：`JSON.parse` 通过；21 条、id 顺序与 Lead 指定一致；必填字段、accent 格式、highlights≥3、sources 均为 https、release 为 `YYYY-MM`、像场圆取值全部通过。
