/**
 * Sample complaints for the tracker mock-up. Not real complaints.
 * Dates are relative to today so the demo always looks current.
 */
export type TrackerStatus = 'received' | 'assigned' | 'in_progress' | 'closed';

export type TrackerSample = {
  /** Days ago each status was reached, in order. */
  history: { status: TrackerStatus; daysAgo: number }[];
};

export const TRACKER_STATUSES: TrackerStatus[] = ['received', 'assigned', 'in_progress', 'closed'];

export const TRACKER_SAMPLES: Record<string, TrackerSample> = {
  'HOSH-DEMO-1042': { history: [{ status: 'received', daysAgo: 47 }] },
  'HOSH-DEMO-2211': {
    history: [
      { status: 'received', daysAgo: 21 },
      { status: 'assigned', daysAgo: 12 },
      { status: 'in_progress', daysAgo: 5 },
    ],
  },
  'HOSH-DEMO-3307': {
    history: [
      { status: 'received', daysAgo: 9 },
      { status: 'assigned', daysAgo: 7 },
      { status: 'in_progress', daysAgo: 6 },
      { status: 'closed', daysAgo: 2 },
    ],
  },
};
