import { HookPost, HookGet } from './hooks';
import { PipeGet, PipePost } from './pipes';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';

export interface Env {
	DB: D1Database;
}

const router = OpenAPIRouter({
	schema: {
		info: {
			title: 'Pipe Worker OpenAPI',
			version: '1.0',
		},
	},
});

router.post('hooks/:hookUrl', HookPost);
router.get('hooks/:hookId', HookGet);

router.post('/pipes/:pipeUrl', PipePost);
router.get('/pipes/:pipeId', PipeGet);

router.post(':hookUrl', HookPost);
router.get(':hookId', HookGet);
router.all('*', () => new Response('404, not found!', { status: 404 }));

export default {
	fetch: router.handle,
} satisfies ExportedHandler<Env>;
