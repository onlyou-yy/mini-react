/**
 * 渲染虚拟DOM到目标上
 * @param {VNode} element 虚拟DOM
 * @param {HTMLElement} container  目标节点
 */
export function render(element,container){
  // 处理文本节点和标签节点
  const dom = element.type === "TEXT_ELEMENT" 
  ? document.createTextNode("")
  : document.createElement(element.type);
  // 为节点绑定属性
  // 判断是否是属性
  const isProperty = key => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(key => {
      dom[key] = element.props[key]
    })

  //处理子节点
  element.props.children.forEach(child => {
    render(child,dom);
  })

  container.appendChild(dom);
}