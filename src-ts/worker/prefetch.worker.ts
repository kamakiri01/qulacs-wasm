self.onmessage = function (event) {
    const message = event.data;
    if (message === "startFetch") {
        WebAssembly.compileStreaming(fetch("module.wasm"))
        .then(module => {
            self.postMessage(module);
        });
    }
}
