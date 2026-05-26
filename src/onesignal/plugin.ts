import { name } from '../../package.json';
import { type OneSignalPluginProps as PluginProps } from '../types';

const withOneSignal = (props: PluginProps): [typeof name, PluginProps] => [name, props];

export default withOneSignal;
