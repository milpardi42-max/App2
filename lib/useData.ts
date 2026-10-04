import { useState, useCallback, useEffect } from 'react';
import { supabase } from './supabase';
import type {
  DeviceActivity,
  DeviceSetting,
  NetworkUsage,
  SecurityEvent,
  InstalledApp,
  RemoteCommand,
  DeviceInfo,
  Contact,
  Device,
} from './types';

export function useDevices() {
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: rows } = await supabase.from('devices').select('*').order('created_at', { ascending: false });
    setData((rows as Device[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}

export function useDeviceActivity(deviceId: string | null, limit = 50) {
  const [data, setData] = useState<DeviceActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from('device_activity').select('*').order('created_at', { ascending: false }).limit(limit);
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data: rows } = await query;
    setData((rows as DeviceActivity[]) || []);
    setLoading(false);
  }, [deviceId, limit]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: rows } = await supabase.from('device_settings').select('*');
    const map: Record<string, string> = {};
    (rows as DeviceSetting[] | null)?.forEach((s) => { map[s.key] = s.value || 'false'; });
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback(async (key: string) => {
    const currentVal = settings[key] === 'true';
    const newVal = !currentVal;
    setSettings((prev) => ({ ...prev, [key]: String(newVal) }));
    await supabase
      .from('device_settings')
      .upsert({ key, value: String(newVal), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }, [settings]);

  return { settings, loading, toggle, reload: load };
}

export function useNetworkUsage(deviceId: string | null, days = 7) {
  const [data, setData] = useState<NetworkUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from('network_usage').select('*').order('date', { ascending: false }).limit(days);
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data: rows } = await query;
    setData((rows as NetworkUsage[]) || []);
    setLoading(false);
  }, [deviceId, days]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}

export function useSecurityEvents(deviceId: string | null) {
  const [data, setData] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from('security_events').select('*').order('created_at', { ascending: false });
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data: rows } = await query;
    setData((rows as SecurityEvent[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { load(); }, [load]);

  const resolve = useCallback(async (id: string) => {
    setData((prev) => prev.map((e) => (e.id === id ? { ...e, resolved: true } : e)));
    await supabase.from('security_events').update({ resolved: true }).eq('id', id);
  }, []);

  return { data, loading, reload: load, resolve };
}

export function useInstalledApps(deviceId: string | null) {
  const [data, setData] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from('installed_apps').select('*').order('name', { ascending: true });
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data: rows } = await query;
    setData((rows as InstalledApp[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = useCallback(async (id: string, blocked: boolean) => {
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, is_blocked: blocked } : a)));
    await supabase.from('installed_apps').update({ is_blocked: blocked }).eq('id', id);
  }, []);

  return { data, loading, reload: load, toggleBlock };
}

export function useRemoteCommands(deviceId: string | null) {
  const [data, setData] = useState<RemoteCommand[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from('remote_commands').select('*').order('created_at', { ascending: false }).limit(30);
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data: rows } = await query;
    setData((rows as RemoteCommand[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { load(); }, [load]);

  const sendCommand = useCallback(async (
    commandType: string,
    parameters: Record<string, unknown> = {},
  ) => {
    const insertPayload: Record<string, unknown> = {
      command_type: commandType,
      status: 'pending',
      parameters,
    };
    if (deviceId) insertPayload.device_id = deviceId;

    const { data: row } = await supabase
      .from('remote_commands')
      .insert(insertPayload)
      .select('*')
      .single();
    if (row) {
      setData((prev) => [row as RemoteCommand, ...prev]);
      setTimeout(async () => {
        const results: Record<string, string> = {
          lock: 'دستگاه با موفقیت قفل شد',
          wipe: 'دستور پاک کردن دریافت شد - در حال اجرا',
          reboot: 'دستگاه در حال راه‌اندازی مجدد',
          screenshot: 'اسکرین‌شات با موفقیت گرفته شد',
          location: 'lat: 35.6892, lng: 51.3890, accuracy: 5m',
          ring: 'دستگاه به مدت ۳۰ ثانیه به صدا درآمد',
          message: 'پیام روی صفحه نمایش داده شد',
          clear_cache: 'حافظه پنهان پاک شد',
          backup: 'پشتیبان‌گیری شروع شد',
          scan: 'اسکن امنیتی شروع شد',
          airplane_mode: 'حالت پرواز تغییر کرد',
          brightness: 'روشنایی صفحه تنظیم شد',
          volume: 'صدای دستگاه تنظیم شد',
          block_app: 'برنامه مسدود شد',
          unblock_app: 'برنامه از حالت مسدود خارج شد',
          install_app: 'دستور نصب برنامه ارسال شد',
          uninstall_app: 'دستور حذف برنامه ارسال شد',
        };
        await supabase
          .from('remote_commands')
          .update({
            status: 'completed',
            result: results[commandType] || 'دستور اجرا شد',
            executed_at: new Date().toISOString(),
          })
          .eq('id', (row as RemoteCommand).id);
        load();
      }, 2000);
    }
  }, [deviceId, load]);

  return { data, loading, reload: load, sendCommand };
}

export function useDeviceInfo(deviceId: string | null) {
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from('device_info').select('*');
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data: rows } = await query;
    const map: Record<string, string> = {};
    (rows as DeviceInfo[] | null)?.forEach((r) => { map[r.key] = r.value || ''; });
    setInfo(map);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { load(); }, [load]);
  return { info, loading, reload: load };
}

export function useContacts(deviceId: string | null) {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    let query = supabase.from('contacts').select('*').order('name', { ascending: true });
    if (deviceId) query = query.eq('device_id', deviceId);
    const { data: rows } = await query;
    setData((rows as Contact[]) || []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = useCallback(async (id: string, blocked: boolean) => {
    setData((prev) => prev.map((c) => (c.id === id ? { ...c, is_blocked: blocked } : c)));
    await supabase.from('contacts').update({ is_blocked: blocked }).eq('id', id);
  }, []);

  return { data, loading, reload: load, toggleBlock };
}
