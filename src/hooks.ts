import { OpenAPIRoute, Path, Str } from '@cloudflare/itty-router-openapi';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { ulid } from 'ulid';
import { z } from 'zod';
import { Env } from '.';

const Hook = z.object({
	id: z.string().ulid(),
	calledAt: z.date(),
	headers: z.record(z.string()),
	body: z.string().optional(),
	collectionUrl: z.string().toLowerCase(),
	pipeId: z.string().ulid().optional(),
});

export class HookGet extends OpenAPIRoute {
	static schema = {
		tags: ['Hooks'],
		summary: 'Get a hook request',
		parameters: {
			hookId: Path(Str, { description: 'The ID of the hook to get' }),
		},
	};

	async handle(request: Request, env: Env, context: ExecutionContext, data: Record<string, any>) {
		const { hookId } = data;
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		// Actually fetch a task using the taskSlug
		const hook = await prisma.hook.findFirst({
			where: {
				id: hookId,
			},
		});

		if (!hook) {
			return new Response('404, not found!', { status: 404 });
		}

		return new Response(JSON.stringify(hook, null, 2), { status: 200 });
	}
}

export class HookPost extends OpenAPIRoute {
	static schema = {
		tags: ['Hooks'],
		summary: 'Receive a webhook',
		parameters: {
			hookSlug: Path(Str, { description: 'The Slug for the hook' }),
		},
		responses: {
			200: { description: 'Hook object', schema: Hook },
		},
	};

	async handle(request: Request, env: Env, context: ExecutionContext, data: Record<string, any>) {
		const { hookUrl } = data;
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const hook = await prisma.hook.create({
			data: {
				id: ulid(),
				body: JSON.stringify(data),
				collectionUrl: hookUrl,
				headers: JSON.stringify(Object.fromEntries(request.headers)),
			},
		});

		return new Response(JSON.stringify(hook, null, 2), { status: 200 });
	}
}
