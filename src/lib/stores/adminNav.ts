import { writable, get } from 'svelte/store';

export type AdminView =
	| { tab: 'overview' }
	| { tab: 'products'; view: 'list' | 'new' | 'update'; slug?: string }
	| { tab: 'pages'; view: 'list' | 'update'; pageName?: string }
	| { tab: 'templates' }
	| { tab: 'catalog'; section: 'categories' | 'product-types' | 'brands' }
	| { tab: 'locations'; view: 'list' | 'new' | 'update'; id?: string }
	| { tab: 'tags' }
	| { tab: 'settings'; section: 'store' | 'page-size' | 'imagekit' | 'admins' | 'audit-logs' };

const SESSION_KEY = 'adminTab';

function getDefaultView(): AdminView {
	if (typeof sessionStorage !== 'undefined') {
		const saved = sessionStorage.getItem(SESSION_KEY);
		if (saved) {
			try {
				return JSON.parse(saved) as AdminView;
			} catch {
				// ignore
			}
		}
	}
	return { tab: 'overview' };
}

function viewToPath(view: AdminView): string {
	switch (view.tab) {
		case 'overview':
			return '/admin?tab=overview';
		case 'products':
			return view.view === 'list'
				? '/admin?tab=products'
				: view.view === 'new'
					? '/admin?tab=products&view=new'
					: `/admin?tab=products&view=update&slug=${view.slug ?? ''}`;
		case 'pages':
			return view.view === 'list'
				? '/admin?tab=pages'
				: `/admin?tab=pages&view=update&pageName=${view.pageName ?? ''}`;
		case 'templates':
			return '/admin?tab=templates';
		case 'catalog':
			return `/admin?tab=catalog&section=${view.section}`;
		case 'tags':
			return '/admin?tab=tags';
		case 'locations':
			return view.view === 'list'
				? '/admin?tab=locations'
				: view.view === 'new'
					? '/admin?tab=locations&view=new'
					: `/admin?tab=locations&view=update&id=${view.id ?? ''}`;
		case 'settings':
			return `/admin?tab=settings&section=${view.section}`;
	}
}

function pathToView(search: string): AdminView {
	const p = new URLSearchParams(search);
	const tab = p.get('tab');

	if (tab === 'products') {
		const view = (p.get('view') as 'list' | 'new' | 'update') || 'list';
		const slug = p.get('slug') ?? undefined;
		return { tab: 'products', view, slug };
	}
	if (tab === 'pages') {
		const view = (p.get('view') as 'list' | 'update') || 'list';
		const pageName = p.get('pageName') ?? undefined;
		return { tab: 'pages', view, pageName };
	}
	if (tab === 'templates') {
		return { tab: 'templates' };
	}
	if (tab === 'catalog') {
		const section = (p.get('section') as 'categories' | 'product-types' | 'brands') || 'categories';
		return { tab: 'catalog', section };
	}
	if (tab === 'tags') {
		return { tab: 'tags' };
	}
	if (tab === 'locations') {
		const view = (p.get('view') as 'list' | 'new' | 'update') || 'list';
		const id = p.get('id') ?? undefined;
		return { tab: 'locations', view, id };
	}
	if (tab === 'settings') {
		const section = (p.get('section') as 'store' | 'page-size' | 'imagekit' | 'admins' | 'audit-logs') || 'store';
		return { tab: 'settings', section };
	}

	return { tab: 'overview' };
}

function createAdminNav() {
	const store = writable<AdminView>(getDefaultView());
	const { subscribe, set } = store;

	function navigate(view: AdminView, replace = false) {
		// Clear product filters when leaving products tab
		const currentView = get(store);
		if (currentView.tab === 'products' && view.tab !== 'products') {
			sessionStorage.removeItem('adminProductFilters');
		}
		const path = viewToPath(view);
		if (replace) {
			history.replaceState({ view }, '', path);
		} else {
			history.pushState({ view }, '', path);
		}
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(view));
		set(view);
	}

	function syncFromUrl() {
		const view = pathToView(window.location.search);
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(view));
		set(view);
	}

	return { subscribe, navigate, syncFromUrl };
}

export const adminNav = createAdminNav();

/** Breadcrumb label helpers */
export function getBreadcrumbs(view: AdminView): { label: string; view?: AdminView }[] {
	switch (view.tab) {
		case 'overview':
			return [{ label: 'Overview' }];
		case 'products':
			if (view.view === 'list') return [{ label: 'Products' }];
			if (view.view === 'new')
				return [
					{ label: 'Products', view: { tab: 'products', view: 'list' } },
					{ label: 'New' },
				];
			return [
				{ label: 'Products', view: { tab: 'products', view: 'list' } },
				{ label: 'Update' },
			];
		case 'pages':
			if (view.view === 'list') return [{ label: 'Pages' }];
			return [
				{ label: 'Pages', view: { tab: 'pages', view: 'list' } },
				{ label: view.pageName ?? 'Update' },
			];
		case 'catalog':
			return [
				{ label: 'Catalog', view: { tab: 'catalog', section: 'categories' } },
				{ label: view.section === 'categories' ? 'Categories' : view.section === 'product-types' ? 'Product Types' : 'Brands' },
			];
		case 'tags':
			return [{ label: 'Tags' }];
		case 'locations':
			if (view.view === 'list') return [{ label: 'Locations' }];
			if (view.view === 'new')
				return [
					{ label: 'Locations', view: { tab: 'locations', view: 'list' } },
					{ label: 'New' },
				];
			return [
				{ label: 'Locations', view: { tab: 'locations', view: 'list' } },
				{ label: 'Update' },
			];
		case 'settings':
			return [
				{ label: 'Settings', view: { tab: 'settings', section: 'store' } },
				{ label: view.section === 'store' ? 'Store' : view.section === 'page-size' ? 'Page Size' : view.section === 'imagekit' ? 'ImageKit' : view.section === 'admins' ? 'Admins' : 'Audit Logs' },
			];
	}
}

/** Returns the parent view to go back to, if any */
export function getParentView(view: AdminView): AdminView | null {
	switch (view.tab) {
		case 'products':
			if (view.view !== 'list') return { tab: 'products', view: 'list' };
			return null;
		case 'pages':
			if (view.view !== 'list') return { tab: 'pages', view: 'list' };
			return null;
		case 'locations':
			if (view.view !== 'list') return { tab: 'locations', view: 'list' };
			return null;
		default:
			return null;
	}
}