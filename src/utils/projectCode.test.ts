import { getProjectCode, formatTaskKey } from './projectCode';

describe('projectCode utilities', () => {
  describe('getProjectCode', () => {
    it('generates 3 initials for 3-word project titles', () => {
      expect(getProjectCode('Cloudflare Edge Engine')).toBe('CEE');
      expect(getProjectCode('omnia ai vision')).toBe('OAV');
      expect(getProjectCode('Zero Trust Auth')).toBe('ZTA');
      expect(getProjectCode('Real Time Metrics')).toBe('RTM');
      expect(getProjectCode('DevLog Mobile Web')).toBe('DMW');
    });

    it('strips version tags before calculating initials', () => {
      expect(getProjectCode('Cloudflare Edge Engine v2.0')).toBe('CEE');
      expect(getProjectCode('Zero Trust Auth v1.4.2')).toBe('ZTA');
    });

    it('handles hyphenated and connector words gracefully', () => {
      expect(getProjectCode('Zero-Trust Auth Suite')).toBe('ZTAS');
      expect(getProjectCode('Mobile Web Client & Offline Sync')).toBe('MWCOS');
      expect(getProjectCode('Real-Time Metrics & Telemetry Aggregator')).toBe('RTMTA');
    });

    it('handles single-word projects', () => {
      expect(getProjectCode('DevLog')).toBe('DEV');
      expect(getProjectCode('Omnia')).toBe('OMN');
    });

    it('handles empty or missing title', () => {
      expect(getProjectCode('')).toBe('PRJ');
      expect(getProjectCode(null)).toBe('PRJ');
      expect(getProjectCode(undefined)).toBe('PRJ');
    });
  });

  describe('formatTaskKey', () => {
    it('returns explicitly set taskKey when provided', () => {
      expect(formatTaskKey('CEE-4', 'Cloudflare Edge Engine', 4, 'uuid-1234')).toBe('CEE-4');
    });

    it('formats key from projectTitle and taskNumber when taskKey is missing', () => {
      expect(formatTaskKey(null, 'Cloudflare Edge Engine', 5)).toBe('CEE-5');
      expect(formatTaskKey('', 'omnia ai vision', 2)).toBe('OAV-2');
    });

    it('falls back to UUID slice if taskNumber is missing', () => {
      expect(formatTaskKey(null, 'Cloudflare Edge Engine', null, 'abcd-efgh')).toBe('CEE-ABCD');
    });
  });
});
