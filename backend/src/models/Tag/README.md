# 标签系统模型

本模块提供了标签系统的数据模型和API接口，用于实现内容标签化和筛选功能。

## 模型概览

### Tag 模型

标签模型用于存储标签信息，包括：
- 标签名称和唯一标识符(slug)
- 标签描述
- 使用次数统计
- 关联的分类

```javascript
const TagSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  useCount: { type: Number, default: 0 },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
});
```

## API接口

标签系统提供以下API接口：

1. **获取所有标签** - `GET /api/tags`
   - 支持分页和排序
   - 默认按使用次数排序

2. **获取热门标签** - `GET /api/tags/popular`
   - 获取使用次数最多的标签
   - 支持限制返回数量

3. **根据ID获取标签** - `GET /api/tags/:tagId`
   - 获取特定标签的详细信息

4. **根据分类获取标签** - `GET /api/tags/by-category/:categoryId`
   - 获取与特定分类关联的所有标签

## 数据索引设计

为提高查询效率，标签模型设计了以下索引：

- `slug`: 用于通过slug快速查询标签
- `useCount`: 用于查询热门标签
- `categories`: 用于按分类查询标签

## 与其他模型的关联

标签系统与以下模型关联：

- **Category**: 标签可以关联到多个分类
- **Stream**: 直播可以添加多个标签(待实现)

## 使用示例

```javascript
// 获取所有标签
const tags = await Tag.find().sort({ useCount: -1 }).limit(20);

// 获取特定分类的标签
const categoryTags = await Tag.find({ categories: categoryId });

// 更新标签使用次数
await Tag.findByIdAndUpdate(tagId, { $inc: { useCount: 1 } });
``` 
