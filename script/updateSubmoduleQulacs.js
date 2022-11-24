const child_process = require("child_process");
const fs = require("fs");
const path = require("path")

const PATH_QULACS_DIR = "./submodules/qulacs/";
const PATH_CMAKELIST = path.join(PATH_QULACS_DIR, "CMakeLists.txt");
const PATH_BUILD_GCC = path.join(PATH_QULACS_DIR, "script", "build_gcc.sh");


const cMakeLists = fs.readFileSync(PATH_CMAKELIST,{ encoding: 'utf8' });
const replacedCMakeLists =  cMakeLists
    .replace("set(DEFAULT_USE_OMP Yes)", "set(DEFAULT_USE_OMP No)")
    .replace("set(DEFAULT_USE_PYTHON Yes)", "set(DEFAULT_USE_PYTHON No)")
    .replace("add_dependencies(qulacs_core Cereal)", "")
    .replace("add_dependencies(qulacs_core eigen)", "");

fs.writeFileSync(PATH_CMAKELIST, replacedCMakeLists);

const buildGccEm = `#!/bin/sh

set -eux

mkdir -p ./build
cd ./build

emcmake cmake -D CMAKE_C_COMPILER="emcc" -D CMAKE_CXX_COMPILER="em++" -D OPT_FLAGS="-mtune=native -march=native" -D CMAKE_BUILD_TYPE=Release -D USE_GPU:STR=No -D "Boost_INCLUDE_DIR=../boost" ..

make -j $(nproc)
cd ../`;
fs.writeFileSync(PATH_BUILD_GCC, buildGccEm);

child_process.execSync(`grep -lr 'x86intrin.h' ./submodules/qulacs/* | xargs sed -i -e 's/x86intrin.h/wasm_simd128.h/g'`);
