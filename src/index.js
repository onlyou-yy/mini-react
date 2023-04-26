import React from "../react";

const elem = <div className="container" style={{width:100,height:100}}>
  <span>hello</span>
  <div>mini</div>
  <span>react</span>
</div>
console.log(elem);

React.render(elem,document.querySelector("#root"));