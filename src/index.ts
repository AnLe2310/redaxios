/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type ResponseType = 'text' | 'json' | 'stream' | 'blob' | 'arrayBuffer' | 'formData';

export type RequestHeaders = { [name: string]: string } | Headers;

export interface Options {
	url?: string;
	method?: HttpMethod;
	headers?: RequestHeaders;
	body?: FormData | string | object;
	responseType?: ResponseType;
	params?: Record<string, any> | URLSearchParams;
	paramsSerializer?: (params: Options['params']) => string;
	withCredentials?: boolean;
	auth?: string;
	xsrfCookieName?: string;
	xsrfHeaderName?: string;
	validateStatus?: (status: number) => boolean;
	transformRequest?: Array<(body: any, headers?: RequestHeaders) => any>;
	baseURL?: string;
	fetch?: typeof window.fetch;
	data?: any;
}

export interface Response<T = any> {
	status: number;
	statusText: string;
	config: Options;
	data: T;
	headers: Headers;
	redirect: boolean;
	url: string;
	type: ResponseType;
	body: ReadableStream<Uint8Array> | null;
	bodyUsed: boolean;
}

type BodylessMethod = <T = any>(url: string, config?: Options) => Promise<Response<T>>;

type BodyMethod = <T = any>(url: string, body?: any, config?: Options) => Promise<Response<T>>;

interface RedaxiosInstance {
	<T = any>(config?: Options): Promise<Response<T>>;
	<T = any>(url: string, config?: Options): Promise<Response<T>>;
	<T = any>(url: string, config?: Options, _method?: string, data?: any, _undefined?: never): Promise<Response<T>>;
	request: RedaxiosInstance;
	get: BodylessMethod;
	delete: BodylessMethod;
	head: BodylessMethod;
	options: BodylessMethod;
	post: BodyMethod;
	put: BodyMethod;
	patch: BodyMethod;
	all: typeof Promise.all;
	spread: <Args extends any[], R>(fn: (...args: Args) => R) => (array: Args) => R;
	CancelToken: typeof AbortController | typeof Object;
	defaults: Options;
	create: (defaults?: Options) => RedaxiosInstance;
}

/**
 * @public
 */
export function create(defaults?: Options): RedaxiosInstance {
	defaults = defaults || {};

	const redaxios = function redaxios<T = any>(
		urlOrConfig?: string | Options,
		config?: Options,
		_method?: string,
		data?: any,
		_undefined?: never
	): Promise<Response<T>> {
		let url: string;
		if (typeof urlOrConfig !== 'string') {
			config = urlOrConfig;
			url = config?.url || '';
		} else {
			url = urlOrConfig;
		}

		const response = { config: config || {} } as Response<T>;

		const options = deepMerge(defaults, config || {}) as Options;

		const customHeaders: Record<string, string> = {};

		data = data || options.data;

		(options.transformRequest || []).forEach((f) => {
			data = f(data, options.headers) || data;
		});

		if (options.auth) {
			customHeaders.authorization = options.auth;
		}

		if (data && typeof data === 'object' && typeof (data as any).append !== 'function' && typeof (data as any).text !== 'function') {
			data = JSON.stringify(data);
			customHeaders['content-type'] = 'application/json';
		}

		try {
			if (options.xsrfCookieName && options.xsrfHeaderName && typeof document !== 'undefined') {
				const match = document.cookie.match(RegExp('(^|; )' + options.xsrfCookieName + '=([^;]*)'));
				if (match) {
					customHeaders[options.xsrfHeaderName] = decodeURIComponent(match[2]);
				}
			}
		} catch (e) {
			// Ignore errors
		}

		if (options.baseURL) {
			url = url.replace(/^(?!.*\/\/)\/?/, options.baseURL + '/');
		}

		if (options.params) {
			url +=
				(~url.indexOf('?') ? '&' : '?') +
				(options.paramsSerializer ? options.paramsSerializer(options.params) : new URLSearchParams(options.params as any).toString());
		}

		const fetchFunc = options.fetch || fetch;

		return fetchFunc(url, {
			method: (_method || options.method || 'get').toUpperCase(),
			body: data as BodyInit,
			headers: deepMerge(options.headers || {}, customHeaders, true) as HeadersInit,
			credentials: options.withCredentials ? 'include' : _undefined
		}).then((res) => {
			for (const i in res) {
				if (typeof (res as any)[i] !== 'function') {
					(response as any)[i] = (res as any)[i];
				}
			}

			if (options.responseType === 'stream') {
				response.data = res.body as any;
				return response;
			}

			const responseType = options.responseType || 'text';
			return (res as any)[responseType]()
				.then((data: any) => {
					response.data = data;
					// its okay if this fails: response.data will be the unparsed value:
					try {
						response.data = JSON.parse(data);
					} catch (e) {
						// Keep original data if JSON parse fails
					}
				})
				.catch(() => {
					// Keep original data on error
				})
				.then(() => {
					const ok = options.validateStatus ? options.validateStatus(res.status) : res.ok;
					return ok ? response : Promise.reject(response);
				});
		});
	} as RedaxiosInstance;

	redaxios.request = redaxios;

	redaxios.get = <T = any>(url: string, config?: Options) => redaxios<T>(url, config, 'get');

	redaxios.delete = <T = any>(url: string, config?: Options) => redaxios<T>(url, config, 'delete');

	redaxios.head = <T = any>(url: string, config?: Options) => redaxios<T>(url, config, 'head');

	redaxios.options = <T = any>(url: string, config?: Options) => redaxios<T>(url, config, 'options');

	redaxios.post = <T = any>(url: string, data?: any, config?: Options) => redaxios<T>(url, config, 'post', data);

	redaxios.put = <T = any>(url: string, data?: any, config?: Options) => redaxios<T>(url, config, 'put', data);

	redaxios.patch = <T = any>(url: string, data?: any, config?: Options) => redaxios<T>(url, config, 'patch', data);

	redaxios.all = Promise.all.bind(Promise);

	redaxios.spread = <Args extends any[], R>(fn: (...args: Args) => R) => {
		return (array: Args) => fn.apply(fn, array);
	};

	redaxios.CancelToken = (typeof AbortController === 'function' ? AbortController : Object) as typeof AbortController | typeof Object;

	redaxios.defaults = defaults;

	redaxios.create = create;

	return redaxios;
}

/**
 * @private
 */
function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(
	opts: T,
	overrides: U,
	lowerCase?: boolean
): T & U {
	if (Array.isArray(opts)) {
		return (opts as any).concat(overrides);
	}

	const out: any = {};
	let i: string;

	for (i in opts) {
		const key = lowerCase ? i.toLowerCase() : i;
		out[key] = opts[i];
	}

	for (i in overrides) {
		const key = lowerCase ? i.toLowerCase() : i;
		const value = overrides[i];
		out[key] = key in out && typeof value === 'object' && value !== null && !Array.isArray(value)
			? deepMerge(out[key], value, key === 'headers')
			: value;
	}

	return out as T & U;
}

export default create();

