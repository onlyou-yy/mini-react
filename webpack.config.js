const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode:"development",
  entry:{
    main:"./src/index.js"
  },
  output:{
    path:path.resolve(__dirname,"./dist"),
    filename:"[name].[hash].js",
  },
  devServer:{
    port:9000,
  },
  module:{
    rules:[
      {
        test:/.js$/,
        use:{
          loader:"babel-loader",
          options:{
            presets:["@babel/preset-env"],
            plugins:["@babel/plugin-transform-react-jsx"]
          }
        }
      }
    ]
  },
  optimization:{
    minimize:false
  },
  plugins:[
    new HtmlWebpackPlugin({
      title:"React",
      template:path.resolve(__dirname,"./src/index.html")
    })
  ]
}