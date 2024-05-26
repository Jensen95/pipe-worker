import { OpenAPIRoute, Path, Str } from '@cloudflare/itty-router-openapi';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { ulid } from 'ulid';
import { z } from 'zod';
import { Env } from '.';

const pipeSchema = z.object({
	id: z.string().ulid(),
	callTimestamp: z.date(),
	statusCode: z.number(),
	response: z.string().optional(),
	responseHeaders: z.record(z.string()).optional(),
	responseTimestamp: z.date().optional(),
	url: z.string().toLowerCase(),
});

// Pipe is at is core just a relay of a request
// But tracks the response and status code as well as timings

export class PipePost extends OpenAPIRoute {
	static schema = {
		tags: ['Pipes'],
		summary: 'Create a pipe request',
		parameters: {
			hookUrl: Path(Str, { description: 'The URL of the pipe to create' }),
		},
		responses: {
			200: { description: 'Created', schema: pipeSchema },
		},
	};

	async handle(request: Request, env: Env, context: ExecutionContext, data: Record<string, any>) {
		// Retrieve the validated slug
		const { pipeUrl } = data;
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const start = Date.now();
		const hook = await fetch(pipeUrl);
		const end = Date.now();

		// Actually fetch a task using the taskSlug
		const pipe = await prisma.pipe.create({
			data: {
				id: ulid(),
				url: pipeUrl,
				callTimestamp: new Date(start),
				responseTimestamp: new Date(end),
				statusCode: hook.status,
				response: await hook.text(),
				responseHeaders: JSON.stringify(Object.fromEntries(hook.headers.entries())),
				collectionUrl: pipeUrl,
			},
		});

		return new Response(JSON.stringify(pipe, null, 2), { status: 200 });
	}
}

export class PipeGet extends OpenAPIRoute {
	static schema = {
		tags: ['Pipes'],
		summary: 'Get a pipe request',
		parameters: {
			pipeUrl: Path(Str, { description: 'The URL of the pipe to get' }),
		},
		responses: {
			200: { description: 'Pipe objects', schema: z.array(pipeSchema) },
		},
	};

	async handle(request: Request, env: Env, context: ExecutionContext, data: Record<string, any>) {
		// Retrieve the validated slug
		const { pipeUrl } = data;
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		// Actually fetch a task using the taskSlug
		const pipeResponse = await prisma.pipe.findFirst({
			where: {
				collectionUrl: pipeUrl,
			},
		});

		if (!pipeResponse) {
			return new Response('404, not found!', { status: 404 });
		}

		return new Response(pipeResponse.id);
	}
}
