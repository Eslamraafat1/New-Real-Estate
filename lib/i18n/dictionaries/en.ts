import { common, nav, labels, listings, forms, mortgage, compareNs, savedNs, footer } from "./en/core";
import { property } from "./en/property";
import { home } from "./en/home";
import { home2 } from "./en/home2";
import { pages } from "./en/pages";
import { admin } from "./en/admin";

export const en = { common, nav, labels, listings, forms, mortgage, compare: compareNs, saved: savedNs, footer, property, home, home2, pages, admin };
export type Dict = typeof en;
