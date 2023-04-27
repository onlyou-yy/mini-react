import React from "../react";

// const elem = <div className="container" style={{width:100,height:100}}>
//   <span>hello</span>
//   <div>mini</div>
//   <span>react</span>
// </div>
// console.log(elem);

// React.render(elem,document.querySelector("#root"));


const container = document.getElementById("root")

const updateValue = e => {
  rerender(e.target.value)
}

const rerender = value => {
  const element = (
    <div>
      <h1>temp 1</h1>
      <input onInput={updateValue} value={value} />
      <h2>Hello mini {value}</h2>
    </div>
  )
  React.render(element, container)

  setTimeout(()=>{
    const element = (
      <div>
        <h1>temp 2</h1>
        <input onInput={updateValue} value={value} />
        <h2>Hello react {value}</h2>
      </div>
    )
    React.render(element, container)
  },2000)
}

rerender("World")