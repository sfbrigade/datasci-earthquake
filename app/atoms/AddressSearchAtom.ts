import { atom } from "jotai";

export const searchedAddressAtom = atom<string | null>(null);
export const isSearchCompleteAtom = atom<boolean>(false);
