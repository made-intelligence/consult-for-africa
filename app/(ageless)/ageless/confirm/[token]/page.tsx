// The confirmation link under the evening's own address. Invitations sent
// before 8 October 2026 carry /lyfe/confirm, which still works.
//
// `dynamic` cannot be re-exported: Next parses route segment config
// statically, so it has to be declared here rather than forwarded.
export { default, metadata } from "@/app/(lyfe)/lyfe/confirm/[token]/page";

export const dynamic = "force-dynamic";
