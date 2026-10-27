import { name } from '../../package.json';
import { type OneSignalPluginProps as PluginProps } from '../types';

const withOneSignal = (props: PluginProps): [string, PluginProps] => [name, props];

export default withOneSignal;
