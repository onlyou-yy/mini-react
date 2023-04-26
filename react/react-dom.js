// 下一功能单元，是一个指针指向当前需要运行的功能单元
let nextUnitOfWork = null;

/**
 * 渲染虚拟DOM到目标上
 * @param {VNode} element 虚拟DOM
 * @param {HTMLElement} container  目标节点
 */
export function render(element,container){
  nextUnitOfWork = {
    dom:container,
    props:{
      children:[element],
    }
  }
}

/**开始工作
 * @param deadline 耗费时间和剩余时间
 */
function workLoop(deadline){
  let shouldYield = false;
  // 有需要执行的单元而且还有时间剩余不需要让出控制权
  while(nextUnitOfWork && !shouldYield){
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 可以用时间小于 1 就让出控制权
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 空闲时间执行任务
  window.requestIdleCallback(workLoop);
}
window.requestIdleCallback(workLoop);

/**执行单元任务
 * 1.将元素添加到 DOM
 * 2.为元素的子元素创建fiber
 * 3.选择下一个工作单元
 */
function performUnitOfWork(fiber){
  //如果fiber的dom还没有创建就先创建
  if(!fiber.dom){
    fiber.dom = createDom(fiber);
  }
  // 如果fiber有父节点，将fiber.dom添加到父节点
  if(fiber.parent){
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // 获取到当前fiber的孩子节点
  const elements = fiber.props.children
  // 索引
  let index = 0
  // 上一个兄弟节点
  let prevSibling = null

  // 遍历孩子节点
  while (index < elements.length) {
    const element = elements[index]
    // 创建fiber
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    // 将第一个孩子节点设置为 fiber 的子节点
    if (index === 0) {
      fiber.child = newFiber
    } else if(element) {
      // 第一个之外的子节点设置为第一个子节点的兄弟节点
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  // 寻找下一个孩子节点，如果有返回
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    // 如果有兄弟节点，返回兄弟节点
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    // 否则返回父节点
    nextFiber = nextFiber.parent
  }
}

//根据Fiber创建真实DOM
function createDom(fiber){
  // 处理文本节点和标签节点
  const dom = fiber.type === "TEXT_ELEMENT" 
  ? document.createTextNode("")
  : document.createElement(fiber.type);
  // 为节点绑定属性
  // 判断是否是属性
  const isProperty = key => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(key => {
      dom[key] = fiber.props[key]
    })

  return dom;
}