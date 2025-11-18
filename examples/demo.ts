/**
 * Demo redaxios TypeScript với API công cộng thật
 * Chạy với: npx tsx examples/demo.ts
 * 
 * Sử dụng:
 * - JSONPlaceholder: https://jsonplaceholder.typicode.com
 * - httpbin.org: https://httpbin.org
 */

import axios, { create } from '../src/index';

// ============================================
// Interface definitions
// ============================================
interface Post {
	id: number;
	userId: number;
	title: string;
	body: string;
}

interface User {
	id: number;
	name: string;
	username: string;
	email: string;
	phone: string;
	website: string;
}

interface CreatePostRequest {
	title: string;
	body: string;
	userId: number;
}

interface CreatePostResponse {
	id: number;
	title: string;
	body: string;
	userId: number;
}

async function runDemo() {
	console.log('🚀 Redaxios TypeScript Demo - Sử dụng API công cộng\n');
	console.log('='.repeat(60));

	// ============================================
	// 1. GET Request - Lấy một post
	// ============================================
	console.log('\n1️⃣  GET Request - Lấy một post từ JSONPlaceholder:');
	try {
		const response = await axios.get<Post>('https://jsonplaceholder.typicode.com/posts/1');
		console.log('✅ Thành công!');
		console.log('   - Post ID:', response.data.id);
		console.log('   - Title:', response.data.title);
		console.log('   - Body:', response.data.body.substring(0, 50) + '...');
		console.log('   - Status:', response.status);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 2. GET Request - Lấy danh sách posts
	// ============================================
	console.log('\n2️⃣  GET Request - Lấy danh sách posts:');
	try {
		const response = await axios.get<Post[]>('https://jsonplaceholder.typicode.com/posts');
		console.log('✅ Thành công!');
		console.log('   - Số lượng posts:', response.data.length);
		console.log('   - Post đầu tiên:', response.data[0].title);
		console.log('   - Status:', response.status);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 3. GET Request với query parameters
	// ============================================
	console.log('\n3️⃣  GET Request với query parameters:');
	try {
		const response = await axios.get<Post[]>('https://jsonplaceholder.typicode.com/posts', {
			params: {
				userId: 1,
				_limit: 5
			}
		});
		console.log('✅ Thành công!');
		console.log('   - Số lượng posts (userId=1, limit=5):', response.data.length);
		console.log('   - Tất cả đều có userId=1:', response.data.every(p => p.userId === 1));
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 4. GET Request - Lấy user
	// ============================================
	console.log('\n4️⃣  GET Request - Lấy thông tin user:');
	try {
		const response = await axios.get<User>('https://jsonplaceholder.typicode.com/users/1');
		console.log('✅ Thành công!');
		console.log('   - User ID:', response.data.id);
		console.log('   - Name:', response.data.name);
		console.log('   - Username:', response.data.username);
		console.log('   - Email:', response.data.email);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 5. POST Request - Tạo post mới
	// ============================================
	console.log('\n5️⃣  POST Request - Tạo post mới:');
	try {
		const newPost: CreatePostRequest = {
			title: 'My New Post',
			body: 'This is the body of my new post created with redaxios!',
			userId: 1
		};

		const response = await axios.post<CreatePostResponse>(
			'https://jsonplaceholder.typicode.com/posts',
			newPost
		);

		console.log('✅ Thành công!');
		console.log('   - Post đã tạo với ID:', response.data.id);
		console.log('   - Title:', response.data.title);
		console.log('   - Status:', response.status);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 6. PUT Request - Cập nhật post
	// ============================================
	console.log('\n6️⃣  PUT Request - Cập nhật post:');
	try {
		const updatedPost = {
			id: 1,
			title: 'Updated Title',
			body: 'Updated body content',
			userId: 1
		};

		const response = await axios.put<Post>(
			'https://jsonplaceholder.typicode.com/posts/1',
			updatedPost
		);

		console.log('✅ Thành công!');
		console.log('   - Post đã cập nhật');
		console.log('   - Title mới:', response.data.title);
		console.log('   - Status:', response.status);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 7. PATCH Request - Cập nhật một phần
	// ============================================
	console.log('\n7️⃣  PATCH Request - Cập nhật một phần:');
	try {
		const response = await axios.patch<Post>(
			'https://jsonplaceholder.typicode.com/posts/1',
			{
				title: 'Patched Title Only'
			}
		);

		console.log('✅ Thành công!');
		console.log('   - Title đã cập nhật:', response.data.title);
		console.log('   - Status:', response.status);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 8. DELETE Request
	// ============================================
	console.log('\n8️⃣  DELETE Request:');
	try {
		const response = await axios.delete('https://jsonplaceholder.typicode.com/posts/1');
		console.log('✅ Thành công!');
		console.log('   - Status:', response.status);
		console.log('   - Post đã được xóa (theo API)');
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 9. Custom Headers với httpbin
	// ============================================
	console.log('\n9️⃣  Request với custom headers (httpbin.org):');
	try {
		const response = await axios.get<{ headers: Record<string, string> }>(
			'https://httpbin.org/headers',
			{
				headers: {
					'X-Custom-Header': 'my-custom-value',
					'X-API-Key': 'demo-key-123',
					'User-Agent': 'redaxios-demo'
				}
			}
		);

		console.log('✅ Thành công!');
		console.log('   - Headers đã gửi:');
		console.log('     - X-Custom-Header:', response.data.headers['X-Custom-Header']);
		console.log('     - X-Api-Key:', response.data.headers['X-Api-Key']);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 10. Tạo instance với baseURL
	// ============================================
	console.log('\n🔟  Tạo instance với baseURL:');
	try {
		const apiClient = create({
			baseURL: 'https://jsonplaceholder.typicode.com',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const response = await apiClient.get<Post>('/posts/2');
		console.log('✅ Thành công!');
		console.log('   - Base URL:', apiClient.defaults.baseURL);
		console.log('   - Post ID:', response.data.id);
		console.log('   - Title:', response.data.title);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 11. Static helpers - axios.all
	// ============================================
	console.log('\n1️⃣1️⃣  Static helpers - axios.all:');
	try {
		const [post1, post2, post3] = await axios.all([
			axios.get<Post>('https://jsonplaceholder.typicode.com/posts/1'),
			axios.get<Post>('https://jsonplaceholder.typicode.com/posts/2'),
			axios.get<Post>('https://jsonplaceholder.typicode.com/posts/3')
		]);

		console.log('✅ Thành công!');
		console.log('   - Post 1:', post1.data.title);
		console.log('   - Post 2:', post2.data.title);
		console.log('   - Post 3:', post3.data.title);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 12. axios.spread
	// ============================================
	console.log('\n1️⃣2️⃣  Static helper - axios.spread:');
	try {
		const result = await axios.all([
			axios.get<Post>('https://jsonplaceholder.typicode.com/posts/1'),
			axios.get<Post>('https://jsonplaceholder.typicode.com/posts/2')
		]).then(
			axios.spread((post1, post2) => {
				return `Post 1: "${post1.data.title}" và Post 2: "${post2.data.title}"`;
			})
		);

		console.log('✅ Thành công!');
		console.log('   - Kết quả:', result);
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	// ============================================
	// 13. Error handling - 404
	// ============================================
	console.log('\n1️⃣3️⃣  Error handling - 404 Not Found:');
	try {
		await axios.get('https://jsonplaceholder.typicode.com/posts/99999');
	} catch (error: any) {
		console.log('✅ Đã bắt được lỗi như mong đợi!');
		console.log('   - Status:', error.status);
		console.log('   - Status Text:', error.statusText);
	}

	// ============================================
	// 14. Response types - text
	// ============================================
	console.log('\n1️⃣4️⃣  Response type - text:');
	try {
		const response = await axios.get<string>('https://httpbin.org/robots.txt', {
			responseType: 'text'
		});

		console.log('✅ Thành công!');
		console.log('   - Response type:', typeof response.data);
		console.log('   - First 50 chars:', response.data.substring(0, 50) + '...');
	} catch (error: any) {
		console.error('❌ Lỗi:', error.message);
	}

	console.log('\n' + '='.repeat(60));
	console.log('✨ Demo hoàn thành! Tất cả các request đã được thực hiện với API thật.\n');
}

// Chạy demo
runDemo().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});

