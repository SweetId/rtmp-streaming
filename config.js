
const config = {
	backend : {
		rtmp: {
			port: 1935,
			chunk_size: 60000,
			gop_cache: true,
			ping: 30,
			ping_timeout: 60,
		},
		http: {
			port: 8000,
			mediaroot: './media',
			webroot: './www',
			allow_origin: '*',
			api: true,

			iptv_auth: false,
			iptv_secret: '',
		},
		https: {
			port: 8443,
			key: './privatekey.pem',
			cert: './certificate.pem',

			iptv_auth: false,
			iptv_secret: '',
		},
		auth: {
			api: true,
			api_user: 'admin',
			api_pass: 'admin',
			play: true,
			publish: false,
			secret: '00000000-0000-0000-0000-000000000000'
		}
	},
	frontend : {
		http: {
			port: 3000,
		},
		https: {
			port: 3001,
			key: './privatekey.pem',
			cert: './certificate.pem',
		}
	}
};

module.exports = config;