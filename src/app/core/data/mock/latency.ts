const NETWORK_LATENCY_MS = 320;

/** Lets the mocks behave like the network, so loading states are visible while developing. */
export function simulateLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_LATENCY_MS));
}
