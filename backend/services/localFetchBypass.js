const fetch = require('node-fetch');
const https = require('https');

const localFetchBypass = (url, options = {}) => {
    const urlStr = url.toString();

    // Intercept requests to the blocked Supabase domain
    if (urlStr.includes('sesyibrhsbicimvvvhba.supabase.co')) {
        options.agent = new https.Agent({
            lookup: (hostname, dnsOptions, callback) => {
                if (hostname === 'sesyibrhsbicimvvvhba.supabase.co') {
                    // Hardcode the Cloudflare Edge IP to bypass ISP Sinkhole
                    if (dnsOptions && dnsOptions.all) {
                        return callback(null, [{ address: '104.18.38.10', family: 4 }]);
                    }
                    return callback(null, '104.18.38.10', 4);
                }
                // Fallback for any other domains to standard DNS lookup
                const dns = require('dns');
                dns.lookup(hostname, dnsOptions, callback);
            }
        });
    }
    return fetch(url, options);
};

module.exports = localFetchBypass;
