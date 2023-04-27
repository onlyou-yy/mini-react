### 为什么在React17之前，每个React组件文件中都要引入 React ？
因为在React组件中写 DOM 结构最终都会被转化成`React.createElement`函数，比如
```js
const elem = <div title="hi">hello mini react</div>
```
将会被转化成
```js
const elem = React.createElement("div",{title:"hi"},"hello mini react");
```
所以在使用到 jsx 语法的文件中都必须要引入`React`（vue2中如果写jsx语法同样要引入`h`或者`const h = this.$createElement`）;

`React.createElement()`方法创建出来的 虚拟节点 信息中比较重要的有
```js
const elem = {
  type:"div", // 标签名称
  props:{ // 属性
    title:"hi", // 标签属性
    children:"hello mini react",//子节点
  }
}
```

### 渲染方案
在React 16之后，渲染真实DOM是用递归 + diff 的形式进行渲染的，这种方式有较大的缺陷就是当 虚拟DOM树 比较大的时候会耗费非常多的资源，而且一旦开始渲染，就不能停止了，直到渲染出完整的树结构。也就是说会造成主线程被持续占⽤，造成的后果就是主线程上的布局、动画等周期性任务就⽆法立即得到处理，造成视觉上的卡顿，影响⽤户体验。
所以在 React 16 之后，将递归的无法中断的更新重构为异步的可中断更新，由于曾经用于递归的虚拟DOM数据结构已经无法满足需要。于是，全新的Fiber架构应运而生。

### fiber 是什么
1. 作为架构来说，之前React15的Reconciler采用递归的方式执行，数据保存在递归调用栈中，所以被称为stack Reconciler。React16的Reconciler基于Fiber节点实现，被称为Fiber Reconciler。
2. 作为静态的数据结构来说，每个Fiber节点对应一个组件，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的DOM节点等信息。
3. 作为动态的工作单元来说，每个Fiber节点保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...）。

fiber 可以看做是一个拥有虚拟DOM全部数据，以及全部前后状态的描述虚拟DOM树的链表

fiber 的结构
```js
const FiberNode = {
  //基础信息
  tag,
  type,
  props,
  stateNode,
  
  // 用于连接其他Fiber节点形成Fiber树
  return,//指向父fiber
  child,//指向子fiber
  sibling,//指向兄弟fiber

  // 副作用
  effectTag,
  nextEffect,
  firstEffect,
  lastEffect,

  alternate
}
```

### 什么是调和
通过如 ReactDOM 等类库使虚拟 DOM 与“真实的” DOM 同步，这一过程叫作协调（调和）。通俗的讲调和指的是将虚拟 DOM映射到真实 DOM 的过程。因此严格来说，调和过程并不能和 Diff 画等号。调和是“使一致”的过程，而 Diff 是“找不同”的过程，它只是“使一致”过程中的一个环节。

### 函数组件
函数组件和标签组件有两个不同点
1. 函数组件中的fiber没有DOM节点
2. children是通过运行函数得到的而不是props




来源：
https://juejin.cn/post/7023319961883901988#heading-67

参考：
https://www.yuque.com/linhe-8mnf5/fxyxkm/daa695
https://kasong.gitee.io/just-react/process/doubleBuffer.html#%E4%BB%80%E4%B9%88%E6%98%AF-%E5%8F%8C%E7%BC%93%E5%AD%98
