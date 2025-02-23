// 下一功能单元，是一个指针指向当前需要运行的功能单元
let nextUnitOfWork = null;
// fiber 根
let wipRoot = null;
// 更新前的根节点 fiber 树
let currentRoot = null;
// 需要删除的节点
let deletions = null;
// 当前处理中的fiber
let wipFiber = null;
// hooks的调用索引
let hookIndex = null;

/**
 * 渲染虚拟DOM到目标上
 * @param {VNode} element 虚拟DOM
 * @param {HTMLElement} container  目标节点
 */
export function render(element,container){
  wipRoot = {
    dom:container,
    props:{
      children:[element],
    },
    // 最后一个fiber树的引用(旧fiber)
    alternate:currentRoot,
  }
  deletions = [];
  // 将根节点设置为下一个将要工作单元
  nextUnitOfWork = wipRoot;
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
  //整个Fiber链都处理完成之后再把整个Fiber 渲染为DOM
  if(!nextUnitOfWork && wipRoot){
    commitRoot();
  }

  // 空闲时间执行任务
  window.requestIdleCallback(workLoop);
}
window.requestIdleCallback(workLoop);

/**
 * 处理提交的fiber树
 * @param {*} fiber 
 */
function commitWork(fiber){
  if(!fiber){
    return
  }
  let domParentFiber = fiber.parent
  // 一直向上找，直到找到有dom的节点
  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }
  // 将自己添加到父节点中
  const domParent = domParentFiber.dom;
  if(fiber.effectTag === "PLACEMENT" && fiber.dom != null){
    // 处理新增节点标记
    domParent.appendChild(fiber.dom);
  }else if(fiber.effectTag === "DELETION"){
    // 处理删除节点标记
    commitDeletion(fiber,domParent);
  }else if(fiber.effectTag === "UPDATE" && fiber.dom != null){
    // 处理更新属性
    updateDom(fiber.dom,fiber.alternate.props,fiber.props)
  }
  

  // 继续处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 提交任务，将fiber tree 渲染为真实 DOM
function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

/**
 * 协调
 * @param {*} wipFiber 当前fiber
 * @param {*} elements 子虚拟DOM
 */
function reconcileChildren(wipFiber,elements){
  // 索引
  let index = 0
  // 上一个兄弟节点
  let prevSibling = null

  //对比新旧Fiber
  // 上次渲染的子fiber
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  // 遍历孩子节点
  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    // 新fiber
    let newFiber = null

    const sameType = oldFiber && element && oldFiber.type == element.type;

    // 新旧都存在且类型相同更新属性即可
    if(sameType){
      newFiber = {
        type: oldFiber.type,//类型
        props: element.props,//属性
        dom: oldFiber.dom,//真实DOM
        parent: wipFiber,//父fiber
        alternate: oldFiber,//对应的就fiber
        effectTag: "UPDATE",//副作用标签
      }
    }

    // 新的存在并且类型和老的不同需要新增
    if(element && !sameType){
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }

    // 老的存在并且类型和新的不同需要移除
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    // 因为现在在遍历子虚拟DOM所以下一个对比的节点必然是兄弟fiber
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    // 将第一个孩子节点设置为 wipFiber 的子节点
    if (index === 0) {
      wipFiber.child = newFiber
    } else if(element) {
      // 第一个之外的子节点设置为第一个子节点的兄弟节点
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

/**执行单元任务
 * 1.将元素添加到 DOM
 * 2.为元素的子元素创建fiber
 * 3.选择下一个工作单元
 */
function performUnitOfWork(fiber){
  // 判断是否为函数
  if(fiber.type && typeof fiber.type === 'function'){
    fiber.type.prototype.isReactComponent 
      ? updateClassComponent(fiber)
      : updateFunctionComponent(fiber)
  } else {
    // 更新普通节点
    updateHostComponent(fiber)
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

/**是否是事件 */
const isEvent = key => key.startsWith("on")
/**判断是否是属性 */
const isProperty = key => key !== "children" && !isEvent(key)
/**是否有新属性 */
const isNew = (prev, next) => key => prev[key] !== next[key]
/**是否有旧属性 */
const isGone = (prev, next) => key => !(key in next)

/**
 * 协调子节点
 * @param {*} fiber 
 */
function updateHostComponent(fiber) {
  // 如果fiber上没有dom节点，为其创建一个
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // 获取到当前fiber的孩子节点
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
}

/**
 * 函数组件处理
 * @param {*} fiber 
 */
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;//重置hooks调用索引
  wipFiber.hooks = [];//当前函数组件依赖的hooks
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

/**
 * 类组件处理
 * @param {*} fiber 
 */
function updateClassComponent(fiber){
  const {type, props} = fiber;
  const children = [new type(props).render()];
  reconcileChildren(fiber, children)
}

/**
 * @param {*} initial 传进来的初始值
 * @returns 
 */
export function useState(initial) {
  // 检查是否有旧的hooks
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
  // 如果有旧的，就复制到新的，如果没有初始化
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []

  actions.forEach(action => {
    hook.state = typeof action === 'function' ? action(hook.state) : action
  })

  // 设置hooks状态
  const setState = action => {
    hook.queue.push(action)
    // 设置一个新的正在进行的工作根作为下一个工作单元，这样工作循环就可以开始一个新的渲染阶段
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}

/**根据Fiber创建真实DOM */
function createDom(fiber){
  // 处理文本节点和标签节点
  const dom = fiber.type === "TEXT_ELEMENT" 
  ? document.createTextNode("")
  : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props)

  return dom;
}

/**
 * 更新dom属性
 * @param {*} dom 
 * @param {*} prevProps 老属性
 * @param {*} nextProps 新属性
 */
function updateDom(dom, prevProps, nextProps) {
  // 移除老的事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // 移除老的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // 设置新的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })
  
  // 添加新的事件处理
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

/**
 * 删除情况下，不断的向下找，直到找到有dom的子节点
 * @param {*} fiber 
 * @param {*} domParent 
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}