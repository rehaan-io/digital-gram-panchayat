/**
 * CustomDateTimePicker.tsx
 * A fully pure-JS date & time picker — no native modules, works in Expo Go.
 * Includes a calendar grid for date selection and a scroll-wheel-style clock for time.
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR (Date picker)
// ─────────────────────────────────────────────────────────────────────────────
interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
}

const CalendarPicker: React.FC<CalendarProps> = ({ value, onChange, minDate }) => {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const today = new Date();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) =>
    value.getFullYear() === viewYear &&
    value.getMonth() === viewMonth &&
    value.getDate() === d;

  const isDisabled = (d: number) => {
    if (!minDate) return false;
    const cell = new Date(viewYear, viewMonth, d);
    cell.setHours(0, 0, 0, 0);
    const min = new Date(minDate); min.setHours(0, 0, 0, 0);
    return cell < min;
  };

  const isToday = (d: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  return (
    <View style={cal.wrap}>
      {/* Month/Year navigation */}
      <View style={cal.header}>
        <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={cal.monthLabel}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={cal.row}>
        {DAYS.map(d => (
          <Text key={d} style={cal.dayLabel}>{d}</Text>
        ))}
      </View>

      {/* Date cells */}
      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={cal.row}>
          {cells.slice(row * 7, row * 7 + 7).map((d, col) => {
            if (!d) return <View key={col} style={cal.cell} />;
            const sel = isSelected(d);
            const dis = isDisabled(d);
            const tod = isToday(d);
            return (
              <TouchableOpacity
                key={col}
                style={[cal.cell, sel && cal.selectedCell, tod && !sel && cal.todayCell]}
                onPress={() => !dis && onChange(new Date(viewYear, viewMonth, d))}
                disabled={dis}
              >
                <Text style={[cal.cellText, sel && cal.selectedText, dis && cal.disabledText]}>
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CLOCK (Time picker — hour & minute columns)
// ─────────────────────────────────────────────────────────────────────────────
interface ClockProps {
  value: Date;
  onChange: (date: Date) => void;
}

const ITEM_H = 44;
const VISIBLE = 5;
const SCROLL_H = ITEM_H * VISIBLE;

const ClockPicker: React.FC<ClockProps> = ({ value, onChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const h12 = value.getHours() % 12 || 12;
  const isPM = value.getHours() >= 12;

  const setHour = (h: number) => {
    const d = new Date(value);
    d.setHours(h);
    onChange(d);
  };
  const setMinute = (m: number) => {
    const d = new Date(value);
    d.setMinutes(m);
    onChange(d);
  };
  const setPeriod = (pm: boolean) => {
    const d = new Date(value);
    let h = d.getHours();
    if (pm && h < 12) d.setHours(h + 12);
    if (!pm && h >= 12) d.setHours(h - 12);
    onChange(d);
  };

  const Col = ({
    items, selected, onSelect, fmt,
  }: { items: number[]; selected: number; onSelect: (v: number) => void; fmt: (v: number) => string }) => {
    const scrollRef = React.useRef<ScrollView>(null);

    React.useEffect(() => {
      const idx = items.indexOf(selected);
      if (idx !== -1 && scrollRef.current) {
        const timer = setTimeout(() => {
          scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: false });
        }, 120);
        return () => clearTimeout(timer);
      }
    }, [selected]);

    return (
      <ScrollView
        ref={scrollRef}
        style={clk.col}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: items.indexOf(selected) * ITEM_H }}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onSelect(items[Math.max(0, Math.min(idx, items.length - 1))]);
        }}
      >
        {/* Padding top/bottom so selected item sits in centre */}
        <View style={{ height: ITEM_H * 2 }} />
        {items.map(v => (
          <TouchableOpacity
            key={v}
            style={[clk.item, v === selected && clk.selectedItem]}
            onPress={() => onSelect(v)}
          >
            <Text style={[clk.itemText, v === selected && clk.selectedItemText]}>{fmt(v)}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: ITEM_H * 2 }} />
      </ScrollView>
    );
  };

  return (
    <View style={clk.wrap}>
      <Text style={clk.title}>Select Time</Text>
      <View style={clk.row}>
        {/* Hours 1–12 */}
        <Col
          items={Array.from({ length: 12 }, (_, i) => i + 1)}
          selected={h12}
          onSelect={h => setHour(isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h))}
          fmt={v => String(v).padStart(2, '0')}
        />
        <Text style={clk.colon}>:</Text>
        {/* Minutes */}
        <Col
          items={minutes}
          selected={value.getMinutes()}
          onSelect={setMinute}
          fmt={v => String(v).padStart(2, '0')}
        />
        {/* AM / PM */}
        <View style={clk.periodCol}>
          {periods.map(p => (
            <TouchableOpacity
              key={p}
              style={[clk.periodBtn, (p === 'PM') === isPM && clk.activePeriod]}
              onPress={() => setPeriod(p === 'PM')}
            >
              <Text style={[clk.periodText, (p === 'PM') === isPM && clk.activePeriodText]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Highlight stripe */}
      <View pointerEvents="none" style={clk.stripe} />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — Trigger button + Modal
// ─────────────────────────────────────────────────────────────────────────────
export type PickerMode = 'date' | 'time' | 'datetime';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: PickerMode;
  minDate?: Date;
  label?: string;
}

const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  value, onChange, mode = 'datetime', minDate, label,
}) => {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<Date>(value);

  const open = () => { setDraft(new Date(value)); setVisible(true); };
  const confirm = () => { onChange(draft); setVisible(false); };
  const cancel = () => setVisible(false);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const buttonLabel =
    mode === 'date' ? fmtDate(value)
      : mode === 'time' ? fmtTime(value)
        : `${fmtDate(value)}  ${fmtTime(value)}`;

  const iconName: any =
    mode === 'date' ? 'calendar-outline'
      : mode === 'time' ? 'time-outline'
        : 'calendar-outline';

  return (
    <>
      <TouchableOpacity style={trigger.btn} onPress={open}>
        <Ionicons name={iconName} size={18} color={COLORS.primary} />
        <Text style={trigger.btnText}>{buttonLabel}</Text>
        <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            {/* Handle */}
            <View style={modal.handle} />

            <Text style={modal.title}>{label || (mode === 'time' ? 'Pick a Time' : mode === 'date' ? 'Pick a Date' : 'Pick Date & Time')}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(mode === 'date' || mode === 'datetime') && (
                <CalendarPicker value={draft} onChange={d => setDraft(prev => {
                  const next = new Date(prev);
                  next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                  return next;
                })} minDate={minDate} />
              )}
              {(mode === 'time' || mode === 'datetime') && (
                <ClockPicker value={draft} onChange={setDraft} />
              )}
            </ScrollView>

            <View style={modal.actions}>
              <TouchableOpacity style={modal.cancelBtn} onPress={cancel}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modal.confirmBtn} onPress={confirm}>
                <Text style={modal.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CustomDateTimePicker;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const cal = StyleSheet.create({
  wrap: { paddingHorizontal: 4, paddingBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  monthLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  dayLabel: { width: 36, textAlign: 'center', fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  cell: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  selectedCell: { backgroundColor: COLORS.primary },
  todayCell: { borderWidth: 1.5, borderColor: COLORS.primary },
  cellText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  selectedText: { color: '#FFFFFF', fontWeight: '700' },
  disabledText: { color: COLORS.border },
});

const clk = StyleSheet.create({
  wrap: { paddingVertical: 12, paddingHorizontal: 8 },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: SCROLL_H },
  col: { width: 64, height: SCROLL_H },
  item: { height: ITEM_H, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  selectedItem: { backgroundColor: COLORS.primaryLight },
  itemText: { fontSize: 22, color: COLORS.textSecondary, fontWeight: '400' },
  selectedItemText: { color: COLORS.primary, fontWeight: '800', fontSize: 26 },
  colon: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginHorizontal: 4 },
  periodCol: { marginLeft: 12, justifyContent: 'center', gap: 8 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  activePeriod: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  activePeriodText: { color: '#FFFFFF' },
  stripe: {
    position: 'absolute',
    top: SCROLL_H / 2 - ITEM_H / 2 + 44,
    left: 0, right: 0, height: ITEM_H,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
});

const trigger = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: COLORS.primaryLight, marginVertical: 6,
  },
  btnText: { flex: 1, fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12,
    maxHeight: '90%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  confirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
