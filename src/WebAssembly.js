import { NativeModules, NativeEventEmitter } from "react-native";
import { Instance as WasmInstance } from "./Instance";

const { Wasm } = NativeModules;
const eventEmitter = new NativeEventEmitter(Wasm);

const generateId = () => {
  return (
    new Date().getTime().toString(16) +
    Math.floor(1000 * Math.random()).toString(16)
  );
};

const instantiate = (buffer) =>
  new Promise((resolve, reject) => {
    const id = generateId();
    const subResolve = eventEmitter.addListener("resolve", (keys) => {
      subResolve.remove();
      if (!id || !keys) {
        reject("failed to instantiate WebAssembly");
      }
      resolve({
        instance: new WasmInstance(id, keys),
        module: {
          // TODO
        },
      });
    });

    Wasm.instantiate(id, buffer.toString())
      .then((res) => {
        if (!res) {
          subResolve.remove();
          reject("failed to instantiate WebAssembly");
        }
      })
      .catch((e) => {
        subResolve.remove();
        reject(e);
      });
  });

export const WebAssembly = {
  instantiate: (buffer, importObject) => {
    return instantiate(buffer);
  },
  // Do not support because `FileReader.readAsArrayBuffer` is not supported by React Native currently.
  // instantiateStreaming: (response, importObject) =>
  //   Promise.resolve(response.arrayBuffer()).then((bytes) =>
  //     instantiate(bytes)
  //   ),
  compile: (bytes) => {},
  // Do not support because `FileReader.readAsArrayBuffer` is not supported by React Native currently.
  // compileStreaming: () => {},
  validate: () => true,
  Instance: () => {},
  Module: () => {},
  Memory: () => {},
  Table: () => {},
};
