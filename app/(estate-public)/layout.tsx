/**
 * Bare passthrough.
 *
 * The tenant and ground-team screens are reached by a link from somebody with
 * no platform account, so none of the authenticated chrome applies — same
 * arrangement as app/(maarova-public).
 */
export default function EstatePublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
