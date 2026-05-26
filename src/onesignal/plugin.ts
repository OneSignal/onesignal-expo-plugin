import { name } from "../../package.json";
import { type OneSignalPluginProps as PluginProps } from "../types/types";

export const oneSignalExpoPlugin = (
  props: PluginProps,
): [typeof name, PluginProps] => [name, props];
