import { redirect } from "next/navigation";

/** The short link read out in the room: consultforafrica.com/live. */
export default function LiveShortLink() {
  redirect("/ageless/live");
}
