# UI组件

本目录包含可复用的UI组件，基于Radix UI构建，并使用Tailwind CSS进行样式设计。

## 组件列表

### Pagination

分页组件，用于在多页内容之间导航。

```tsx
<Pagination 
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setPage(page)}
/>
```

特性:
- 动态显示页码，根据当前页码智能展示相邻页码
- 支持首页、末页直达
- 省略号表示跳过的页码区间
- 支持上一页、下一页快捷导航
- 完全可自定义外观

### Switch

切换开关组件，用于表示开/关状态。

```tsx
<Switch 
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>
```

特性:
- 支持键盘访问和导航
- 符合ARIA规范，支持辅助技术
- 平滑过渡动画
- 可自定义颜色和大小

### Select

下拉选择组件，用于从多个选项中选择一个。

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="选择选项" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">选项1</SelectItem>
    <SelectItem value="option2">选项2</SelectItem>
  </SelectContent>
</Select>
```

特性:
- 支持键盘导航
- 自动管理弹出位置
- 虚拟化滚动支持大量选项
- 完全可自定义外观

## 设计原则

1. **可访问性优先**: 所有组件遵循WAI-ARIA标准，确保键盘可访问和屏幕阅读器友好。
2. **可组合**: 组件遵循原子设计原则，可以灵活组合创建复杂UI。
3. **可自定义**: 使用Tailwind CSS并支持className透传，允许高度自定义样式。
4. **暗色主题优化**: 默认设计考虑了暗色主题，符合直播平台整体风格。
5. **响应式**: 所有组件默认适配移动设备到桌面设备不同屏幕尺寸。

## 技术实现

这些组件基于以下技术栈构建:
- React 18+ 并遵循React最佳实践
- Radix UI提供无样式但可访问的基础组件
- Tailwind CSS用于样式设计
- TypeScript提供类型安全 
