module.exports = {
	'/admin*': {
		get: 'admin'
	},
	'/api': {
		'/install': {
			get: 'install.status',
			post: 'install.install',
			'/themes': {
				get: 'install.themes',
			},
			'/test-database': {
				put: 'install.testDatabase'
			}
		},
		'/account': {
			all: 'account.check',
			get: 'account.current',
			put: [109001, 'account.update'],
			'/sign-in': {
				put: 'account.signIn'
			},
			'/sign-out': {
				put: 'account.signOut'
			}
		},
		'/*': {
			all: 'account.check'
		},
		'/dashboard': {
			get: 'dashboard'
		},
		'/users': {
			get: 'users.get'
		},
		'/features': {
			get: [100100, 'features.all'],
			post: [100101, 'features.create'],
			'/:feature': {
				get: [100100, 'features.one'],
				put: [100101, 'features.update'],
				delete: [100101, 'features.remove']
			}
		},
		'/contents': {
			post:   [100201, 'contents.create'],
			delete: [100201, 'contents.remove'],
			put:    [100201, 'contents.update'],
			get:    [100200, 'contents.list'],
			'/:content': {
				delete: [100201, 'contents.remove'],
				put:    [100201, 'contents.update'],
				get:    [100200, 'contents.one']
			}
		},
		'/pages/:page': {
			get: [100300, 110200, 'pages.get'],
			put: [100301, 'pages.save']
		},
		'/media': {
			get: [100400, 100100, 100200, 100300, 'media.list'],
			post: [100401, 100101, 100201, 100301, 'media.create'],
			'/:medium': {
				put: [100401, 100101, 100201, 100301, 'media.update'],
				delete: [100401, 100101, 100201, 100301, 'media.remove']
			}
		},
		'/site-info': {
			get: [110100, 'site-info.get'],
			put: [110101, 'site-info.update']
		},
		'/categories': {
			get: [110200, 100200, 100201, 100300, 100301, 'categories.query'],
			post: [110201, 'categories.create'],
			'/:_id': {
				get: [110200, 100200, 100300, 'categories.one'],
				put: [110201, 100301, 'categories.update'],
				delete: [110201, 'categories.remove']
			}
		},
		'/models': {
			get: [110300, 110400, 100100, 'models.query'],
			post: [110301, 110401, 100101, 'models.create'],
			'/:_id': {
				get: [110300, 110400, 100100, 100200, 'models.one'],
				put: [110301, 110401, 100101, 'models.update'],
				delete: [110301, 110401, 100101, 'models.remove']
			}
		},
		'/authorities': {
			get: 'authorities'
		},
		'/roles': {
			get: [110500, 110600, 'roles.list'],
			post: [110501, 'roles.create'],
			'/:_id': {
				get: [110500, 'roles.one'],
				put: [110501, 'roles.update'],
				delete: [110501, 'roles.remove']
			}
		},
		'/admin-users': {
			get: [110600, 'admin-users.list'],
			post: [110601, 'admin-users.create'],
			'/:_id': {
				get: [110600, 'admin-users.one'],
				put: [110601, 'admin-users.update'],
				delete: [110601, 'admin-users.remove']
			}
		},
		'/views': {
			get: [110100, 110201, 'views']
		},
		'/statistics': {
			put: 'statistics'
		}
	},
	'*': { get: 'install.access' },
	'/': { get: 'home' },
	'/search': { get: 'search' },
	'/find':{get: 'find' },
	'/:channel*': { get: 'channel' },
	'/:column*': { get: 'column' },
	'/:page*': { get: 'page' },
	'/:content*': { get: 'content' },
	'/*': { get: 'errors.notFound' }
};