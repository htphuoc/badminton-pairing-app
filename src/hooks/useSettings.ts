import { useState, useEffect, useCallback } from 'react';
import type { CostSettings } from '../models/types';
import { ApiClient } from '../lib/api';

const emptySettings: CostSettings = {
  courtFeePerHour: 130000,
  courtFeeFixedPerHour: 130000,
  courtFeeCasualPerHour: 180000,
  shuttleFee: 28000,
  splitMethod: 'EQUAL',
  femaleDiscountPercent: 10,
  defaultCourtsByWeekday: {},
};

export function useSettings() {
  const [settings, setSettings] = useState<CostSettings>(emptySettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await ApiClient.get<CostSettings>('/settings');
      setSettings({ ...emptySettings, ...data });
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: CostSettings) => {
    try {
      await ApiClient.put('/settings', newSettings);
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to update settings', err);
      throw err;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings
  };
}
