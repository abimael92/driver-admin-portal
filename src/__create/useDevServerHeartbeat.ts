import { useIdleTimer } from 'react-idle-timer';

export function useDevServerHeartbeat() {
	// Only run on client side
	if (typeof window === 'undefined') {
		return;
	}

	useIdleTimer({
		throttle: 60_000 * 3,
		timeout: 60_000,
		onAction: () => {
			fetch('/', {
				method: 'GET',
			}).catch((error) => {
				// this is a no-op, we just want to keep the dev server alive
			});
		},
	});
}
