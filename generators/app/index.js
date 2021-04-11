// 此文件作为 Generator 的核心入口
 
// 1. 需要引如 yeoman-generator 的一个基类
const Generator = require('yeoman-generator')

// 2. 创建我们自己的genenrator类，然后继承基类，最后导出我们所创建的类型。
// 当我们通过 yo 生成器名子 的时候会自动执行这个入口文件，并调用我们所创建并导出这个类的生命周期来做某些事情，如writing中的生成项目的基础结构
module.exports = class extends Generator {
  // 3. 如果需要以命令行交互的形式询问用户一些问题关于如何生成项目的基础结构 可以使用prompting方法
  prompting() {
    // 4. prompt 方法返回promise对象
    return this.prompt([
      { 
        type: 'input', // 交互类型
        name: 'name', // 用来存储当前输入值的变量名称
        message: 'Your project name ?', // 问题名称
        default: this.appname // 默认值， this.appname 是通过yo运行我们自定义generator 时所在的文件名
      }
    ])
    .then(answers => {
      // 5. 将我们拿到的问题的答案通过this.answer 变量存储起来，以便我们再接下来生成项目基础结构的时候使用得到。
      this.answers = answers
    })
  }

  // 6. writing方法是用来生成项目文件的方法
  // 7. yeoman-generator 可以允许我们以模板的形式生成项目基础结构， 我们需要再 generators/app/ 下面创建一个 template 文件夹，将我们需要生成的项目文件都放在这个文件夹里面。
  // 8. 因为是通过模板引擎生成项目基础结构，所以可以通过模板引擎的模板语法进行 "挖坑" 如 <%= name %>，如果想要原封不动的输出 <%= name %>,可以通过再添加一个%来进行转译如 <%%=name%>
  writing() {
    // 9. 把templates文件下的每一个文件通过模板转换到目标路径
    // 将每一个文件的相对路径定义成数组，通过遍历的形式通过模板生成目标路径
    const templates = [
      '.gitignore',
      'babel.config.js',
      'package.json',
      'package-lock.json',
      'README.md',
      'src/assets/logo.png',
      'src/components/HelloWorld.vue',
      'src/components/Calendar/index.vue',
      'src/components/Calendar/utils.js',
      'src/App.vue',
      'src/main.js',
      'public/favicon.ico',
      'public/index.html'
    ]

    templates.forEach(item => {
      // item  为每个文件路径
      // 10. 通过yeoman-generator这个基类提供的fs.copyType 将 template 下的文件生成 我们自己项目的文件
      // fs.copyType(模板路径，自己项目输出目标路径，模板参数)的参数
      // 
      this.fs.copyTpl(
        this.templatePath(item),
        this.destinationPath(item),
        this.answers
      )
    })
  }

}