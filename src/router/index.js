import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CharEncoding from '@/components/CharEncoding.vue';
import DataTable from '@/components/DataTable.vue';
import ImageUnpack from '@/components/ImageUnpack.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/char',
			name: 'char encoding',
			component: CharEncoding,
		},
		{
			path: '/data',
			name: 'data table',
			component: DataTable,
		},
		{
			path: '/image',
			name: 'image unpack',
			component: ImageUnpack,
		},
		{
			path: '/about',
			name: 'about',
			// Route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('../views/AboutView.vue'),
		},
	],
});

export default router;
