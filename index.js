// 该方法用于从JavaScript环境向指定的共享堆内存段填充数据
function importArrayToBuffer(memory, array, offset) {
  const importBuffer = new Uint32Array(memory.buffer, offset, array.length);
  for (let i = 0; i < array.length; i++) {
    importBuffer[i] = array[i];
  }
}

// 从远程加载一个Wasm模块，并将该模块中的内容抓换成二进制数据
let startTime = performance.now();
fetch('program.wasm').then(response => response.arrayBuffer()).then(bytes => {
  let memory;
  // 通过浏览器提供的标准 WebAssembly 接口来编译和初始化一个 Wasm 模块
  WebAssembly.compile(bytes).then(module => {
    WebAssembly.instantiate(module, {
      env: {
        // 需要导入到模块中的JavaScript函数体
        print(offset, len) {
          let strBuffer = new Uint32Array(memory.buffer, offset, len);
          document.querySelector('.sequence').innerText = JSON.stringify(Object.values(strBuffer));
        }
      }
    }).then(instance => {
      // 输出下载、编译以及实例化 Wasm 模块的时间
      console.log(performance.now() - startTime);
      // 取出从 Wasm 模块中导出的函数
      let exports = instance.exports;
      // 后去该 Wasm 模块实例使用的堆内存对象
      memory = exports.memory;
      let arr = [];
      // 生成一个包含有10个元素的整型数组
      for (let index = 0; index < 10; index++) {
        arr.push(Math.round(Math.random() * 10));
      }
      document.querySelector('.sequence-before').innerText = JSON.stringify(arr);
      // 将整型数组内的元素依次填充到指定的内存段中，即填充到 Wasm 模块初始化时生成的数组中
      importArrayToBuffer(memory, arr, exports.getArrayOffset());
      // 调用 Wasm 模块暴露出的排序行数
      exports.sort();

    });
  });


  WebAssembly.compile(bytes).then(module => {
    // 查看 Wasm 模块实例中名为 customized 的自定义段内容
    
    // console.log(WebAssembly.Module.customSections(module, 'customized'));
    console.log(WebAssembly.Module.exports(module));
    console.log(WebAssembly.Module.imports(module));
  });

});