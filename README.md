###为什么在React17之前，每个React组件文件中都要引入 React ？
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

