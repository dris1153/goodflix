import { create } from 'zustand'

type GlobalStore = {}

const store = () => ({})

const useGlobalStore = create<GlobalStore>(store)
export default useGlobalStore

export function setGlobalStore<T extends keyof GlobalStore>(x: Pick<GlobalStore, T>) {
    useGlobalStore.setState(x)
}
