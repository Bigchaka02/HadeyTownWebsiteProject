// A soft night tint over the map, based on the visitor's own clock.
// Full night runs 9pm-5am; the two hours on either side fade the tint in
// and out so the change is never abrupt.
const MAX_OPACITY = 0.32;

export function nightOpacity(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  const sinceNine = (hour - 21 + 24) % 24; // hours since 9pm, wrapping past midnight
  const amount =
    sinceNine <= 8 ? 1 : sinceNine <= 10 ? 1 - (sinceNine - 8) / 2 : sinceNine >= 22 ? (sinceNine - 22) / 2 : 0;
  return amount * MAX_OPACITY;
}
