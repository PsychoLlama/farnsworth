import store from './redux-store';
import tinker from './tinker';
import createSdk from './create-sdk';

export default tinker.addTool('sdk', createSdk(store));
