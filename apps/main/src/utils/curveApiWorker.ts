import curve from '@curvefi/api'
import { JsonRpcProvider } from 'ethers'
import { JsonRpcPayload, JsonRpcResult, JsonRpcSigner } from 'ethers/lib.commonjs/providers/provider-jsonrpc'

type resolve<T=any> = (value: T | Promise<T>) => void;
type reject = (reason?: unknown) => void;
const futures: Record<string, [resolve, reject]> = {};


class ExternalRpcProvider extends JsonRpcProvider {
  constructor(private readonly type: string) {
    super();
  }

  _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<JsonRpcResult[]> {
    return new Promise<JsonRpcResult[]>((resolve, reject) => {
      const id = crypto.randomUUID()
      futures[id] = [resolve, reject];
      self.postMessage({ type: 'provider.send', id, params: payload });
    })
  }

  getSigner(address?: number | string): Promise<JsonRpcSigner> {
    if (this.type != 'Web3') return null as any;
    return super.getSigner(address);
  }
}

function onMessage(e: MessageEvent) {
  const { id, type, params } = e.data
  console.log('Received from UI', type,id,params);
  switch (type) {
    case 'init':
      const  externalProvider = new ExternalRpcProvider(type);
      return respondUI(id, curve.init(
        'External',
        { externalProvider },
        params.options
      ).then(() => console.log(curve)));
    case 'factory':
      const [factoryName, method, ...args] = params;
      return respondUI(id, (curve as any)[factoryName][method](...args));
    case 'resolve':
      const resolve = futures[id][0]
      delete futures[id];
      return resolve(params);
    case 'reject':
      const reject = futures[id][1]
      delete futures[id];
      return reject(params);
    default:
      if (type in curve) {
        return respondUI(id, (curve as any)[type](...params));
      }
      return respondUI(id, Promise.reject(`Unknown method ${type}`));
  }
}

self.addEventListener('message', onMessage);
export {};

const _check = (p: unknown) => {
  if (p instanceof Promise || p instanceof Function) {
    debugger;
    throw Error('Promises and functions are not allowed in worker requests');
  }
  return p;
}
const respondUI = <T extends unknown[]>(id: string, promise: T | Promise<T>) => Promise.resolve(promise)
  .then(params => self.postMessage({ type: 'resolve', id, params: _check(params) }))
  .catch(params => self.postMessage({ type: 'reject', id, params: _check(params) }))
