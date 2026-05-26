import { name } from '../../package.json';
import { type OneSignalPluginProps as PluginProps } from '../types';

export default (props: PluginProps): [typeof name, PluginProps] => [name, props];
