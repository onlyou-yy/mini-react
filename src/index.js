import React from "../react";

// const elem = <div className="container" style={{width:100,height:100}}>
//   <span>hello</span>
//   <div>mini</div>
//   <span>react</span>
// </div>
// console.log(elem);

// React.render(elem,document.querySelector("#root"));


// const container = document.getElementById("root")

// const updateValue = e => {
//   isTemp1 
//   ? rerender1(e.target.value)
//   : rerender2(e.target.value)
// }

// let isTemp1 = true;
// const changeTemp = ()=>{
//   isTemp1 = !isTemp1;
//   if(isTemp1){
//     rerender1("temp 1");
//   }else{
//     rerender2("temp 2")
//   }
// }

// const rerender1 = value => {
//   const element = (
//     <div>
//       <h1>temp 1</h1>
//       <input onInput={updateValue} value={value} />
//       <h2>Hello mini {value}</h2>
//       <button onClick={changeTemp}>change temp 2</button>
//     </div>
//   )
//   React.render(element, container)
// }

// const rerender2 = value => {
//   const element = (
//     <div>
//       <h1>temp 2</h1>
//       <input onInput={updateValue} value={value} />
//       <h2>Hello react {value}</h2>
//       <button onClick={changeTemp}>change temp 2</button>
//     </div>
//   )
//   React.render(element, container)
// }

// rerender1("World")



// function App(props){
//   return <h1>H1,{props.name}!</h1>
// }

// const element = (<App name='foo'></App>)

// React.render(element, document.getElementById("root"))

// function Counter() {
//   const [state, setState] = React.useState(1)
//   return (
//     <div>
//       <h1 >
//         Count: {state}
//       </h1>
//       <button onClick={() => setState(c => c + 1)}>+1</button>
//     </div>
//   )
// }
// const element = <Counter />

// React.render(element, document.getElementById("root"))


class Counter extends React.Component {
  render() {
    return (
      <div>
        <h1>我是</h1>
        <h2>class组件</h2>
      </div>
    )
  }
}

const element = <Counter />

React.render(element, document.getElementById("root"))