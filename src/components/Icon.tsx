export function Icon({ name }: { name: string }) {
  // The Ionicons script upgrades the element (adds role/class) before React
  // hydrates, which would otherwise be reported as a mismatch.
  return <ion-icon name={name} aria-hidden="true" suppressHydrationWarning />;
}
