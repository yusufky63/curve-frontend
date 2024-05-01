import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethcall'
import { Contract, ethers, Networkish } from 'ethers'
import type { IBasePoolShortItem, IDict, INetworkName, IPoolData } from '@curvefi/api/lib/interfaces'
import { createProvider } from '@curvefi/api/lib/curve'
import { PoolTemplate } from '../../../../../curve-js/lib/pools'

type resolve<T = any> = (value: T | Promise<T>) => void;
type reject = (reason?: unknown) => void;

class CurveFactoryAdapter {
  constructor(private readonly name: string, private readonly requestWorker: (type: string, ...args: unknown[]) => Promise<any>) {}

  fetchPools = (force: boolean) => this.requestWorker('factory', this.name, 'fetchPools', force);
  fetchNewPools = () => this.requestWorker('factory', this.name, 'fetchNewPools');
}

export class CurveApiAdapter implements CurveApi {
  private readonly worker = new Worker(new URL('./curveApiWorker', import.meta.url))

  async init(
    providerType: 'JsonRpc' | 'Web3' | 'Infura' | 'Alchemy',
    providerSettings: { url?: string, privateKey?: string, batchMaxCount?: number } | {
      externalProvider: ethers.Eip1193Provider
    } | { network?: Networkish, apiKey?: string },
    options: { gasPrice?: number, maxFeePerGas?: number, maxPriorityFeePerGas?: number, chainId?: number } = {} // gasPrice in Gwei
  ): Promise<void> {
    this.options = options;
    [this.provider, this.signer] = await createProvider(providerType, providerSettings)
    this.worker.onmessage = (e) => {
      const { type, params, id } = e.data
      return this._onMessage(type, id, params)
    }
    this.constants = await this._requestWorker('init', { options })
  }

  private _onMessage(type: string, id: string, params: any) {
    console.log('Received from worker', type, id, params)
    switch (type) {
      case 'provider.send':
        return this._respondWorker(id, this.provider._send(params))
      case 'setContract':
        return this.setContract(params.address, params.abi)
      case 'resolve':
        return this._futures[id][0](params)
      case 'reject':
        return this._futures[id][1](params)
      default:
        console.log('Unknown message', type)
    }
  }

  provider!: ethers.BrowserProvider | ethers.JsonRpcProvider
  multicallProvider: MulticallProvider | null = null
  signer: ethers.Signer | null = null
  signerAddress: string = ''
  chainId: number = 1
  contracts: { [index: string]: { contract: Contract, multicallContract: MulticallContract } } = {}
  feeData: { gasPrice?: number, maxFeePerGas?: number, maxPriorityFeePerGas?: number } = {}
  constantOptions: { gasLimit: number } = { gasLimit: 12000000 }
  options: { gasPrice?: number | bigint, maxFeePerGas?: number | bigint, maxPriorityFeePerGas?: number | bigint } = {}
  constants!: {
    NATIVE_TOKEN: { symbol: string, wrappedSymbol: string, address: string, wrappedAddress: string },
    NETWORK_NAME: INetworkName,
    ALIASES: IDict<string>,
    POOLS_DATA: IDict<IPoolData>,
    FACTORY_POOLS_DATA: IDict<IPoolData>,
    CRVUSD_FACTORY_POOLS_DATA: IDict<IPoolData>,
    EYWA_FACTORY_POOLS_DATA: IDict<IPoolData>,
    CRYPTO_FACTORY_POOLS_DATA: IDict<IPoolData>,
    TWOCRYPTO_FACTORY_POOLS_DATA: IDict<IPoolData>,
    TRICRYPTO_FACTORY_POOLS_DATA: IDict<IPoolData>,
    STABLE_NG_FACTORY_POOLS_DATA: IDict<IPoolData>,
    BASE_POOLS: IDict<number>,
    LLAMMAS_DATA: IDict<IPoolData>,
    COINS: IDict<string>,
    DECIMALS: IDict<number>,
    FACTORY_GAUGE_IMPLEMENTATIONS: IDict<number>,
    GAUGES: string[],
    ZERO_ADDRESS: string
  }

  setContract(address: string, abi: any): void {
    this.contracts[address] = {
      contract: new Contract(address, abi, this.signer || this.provider),
      multicallContract: new MulticallContract(address, abi)
    }
  }

  private readonly _futures: Record<string, [resolve, reject]> = {}

  private _requestWorker = <T>(type: string, ...params: unknown[]) =>
    new Promise<T>((resolve, reject) => {
      if (params?.find(p => p instanceof Promise || p instanceof Function)) {
        debugger;
        return reject('Promises and functions are not allowed in worker requests');
      }
      const id = crypto.randomUUID()
      this._futures[id] = [
        val => {
          resolve(val);
          delete this._futures[id];
        },
        err => {
          reject(err);
          delete this._futures[id];
        }
      ];
      return this._post(id, type, params)
    })

  private _post(id: string, type: string, params: unknown) {
    try {
      return this.worker.postMessage({ type, id, params })
    } catch (error) {
      console.error(error)
      debugger;
    }
  }

  private _respondWorker = (id: string, promise: Promise<unknown>) => promise
    .then(params => this._post(id, 'resolve', params ))
    .catch(params => this._post(id, 'reject', params ))

  hasDepositAndStake = () => this._requestWorker<boolean>('hasDepositAndStake');
  hasRouter = () => this._requestWorker<boolean>('hasRouter');
  getPoolList = () => this._requestWorker<boolean>('getPoolList');
  getVolume = (network?: string) => this._requestWorker<boolean>('getVolume', network);
  getBasePools = () => this._requestWorker<IBasePoolShortItem[]>('getBasePools');
  getPool = (poolId: string) => this._requestWorker<PoolTemplate>('getPool', poolId);
  getUsdRate = (coin: string) => this._requestWorker<Promise<number>>('getUsdRate', coin);
  getGasPriceFromL1 = () => this._requestWorker<number>('getGasPriceFromL1');
  getGasPriceFromL2 = () => this._requestWorker<number>('getGasPriceFromL2');
  getTVL = (network?: string) => this._requestWorker<boolean>('getTVL', network);
  getBalances = (coins: string[], ...addresses: string[] | string[][]) => this._requestWorker<string[] | IDict<string[]>>('getBalances', coins, ...addresses);
  getAllowance = (coins: string[], address: string, spender: string) => this._requestWorker<string[]>('getAllowance', coins, address, spender);
  hasAllowance = (coins: string[], amounts: (string | number)[], address: string, spender: string) => this._requestWorker<boolean>('hasAllowance', coins, amounts, address, spender);
  ensureAllowance = (coins: string[], amounts: (string | number)[], spender: string, isMax?: boolean) => this._requestWorker<string[]>('ensureAllowance', coins, amounts, spender, isMax);
  getCoinsData = (...coins: string[] | string[][]) => this._requestWorker<{name: string; symbol: string; decimals: number; }[]>('getCoinsData', ...coins);
  setCustomFeeData = (customFeeData: { gasPrice?: number, maxFeePerGas?: number, maxPriorityFeePerGas?: number }) => this._requestWorker<void>('setCustomFeeData', customFeeData);

  factory = new CurveFactoryAdapter('factory', this._requestWorker);
  cryptoFactory = new CurveFactoryAdapter('cryptoFactory', this._requestWorker);
  twocryptoFactory = new CurveFactoryAdapter('twocryptoFactory', this._requestWorker);
  crvUSDFactory = new CurveFactoryAdapter('crvUSDFactory', this._requestWorker);
  tricryptoFactory = new CurveFactoryAdapter('tricryptoFactory', this._requestWorker);
  stableNgFactory = new CurveFactoryAdapter('stableNgFactory', this._requestWorker);

}


// export const createCurveApi = () => {
//   const adapter = new CurveApiAdapter();
//   return new Proxy(adapter, {
//     get(target: CurveApiAdapter, key: string | symbol, receiver: any): any {
//       if (key in target) {
//         const value = target[key as keyof CurveApiAdapter]
//         if (value instanceof Function) {
//           return value.bind(target)
//         }
//         return value;
//       }
//       if (key == 'then') {
//         return () => {
//           debugger;
//         }
//       }
//       console.log('Proxy get', key);
//       return (...args: any[]) => target.requestWorker(key.toString(), args)
//     }
//   });
// }
