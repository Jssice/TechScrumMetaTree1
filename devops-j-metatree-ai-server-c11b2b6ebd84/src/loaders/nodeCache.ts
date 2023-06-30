import NodeCache from 'node-cache';
const chatHistoryCache = new NodeCache({
	stdTTL: 0,
	checkperiod: 300
});

export default chatHistoryCache;
