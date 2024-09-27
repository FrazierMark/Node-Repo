import * as cookie from 'cookie';

const cookieName = 'panel_state';
export type PanelState = 'open' | 'closed';

export function getPanelState(request: Request): PanelState {
	const cookieHeader = request.headers.get('cookie');
	const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : null;
	if (parsed === 'open' || parsed === 'closed') return parsed;
	return 'closed';
}

export function setPanelState(panel: PanelState) {
	return cookie.serialize(cookieName, panel, { path: '/', maxAge: 60 * 60 * 24 }); 
}