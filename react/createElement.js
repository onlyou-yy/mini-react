/**
 * 创建虚拟节点
 * @param {String} type 类型
 * @param {*} props 属性
 * @param {*} children 子节点
 * @returns 
 */
export function createElement(type,props,...children){
  return {
    type,
    props:{
      ...props,
      children: children.map(child => {
        return typeof child === "object" ? 
        child : 
        createTextElement(child);
      })
    }
  }
}

/**
 * 生成文本虚拟节点
 * @param {String} text 
 * @returns 
 */
export function createTextElement(text){
  return {
    type:"TEXT_ELEMENT",
    props:{
      nodeValue:text,
      children:[]
    }
  }
}