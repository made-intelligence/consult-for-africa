import type { MaarovaModuleType } from "@prisma/client";

export interface TwinOption {
  /** Must equal the dimension of the option it parallels, in the same position. */
  dimension?: string;
  label: string;
}

export interface Twin {
  module: MaarovaModuleType;
  /** The exact stem of the clinical item this parallels. Matched verbatim. */
  of: string;
  /** The twin's stem, same scenario in a non-clinical world. */
  text: string;
  /**
   * Replacement option text, in the original's order.
   *
   * Prefer plain strings. The seeder then copies every other key from the
   * option it parallels, so weights, eqDimension and dimension cannot drift:
   * parity is guaranteed by construction rather than checked after the fact.
   * That matters because the scoring keys differ by module, and an option
   * carrying weight 5 replaced by one carrying weight 1 changes the score
   * without changing anything visible.
   *
   * Objects are still accepted, and then every key they do carry is verified
   * against the original.
   *
   * Omit entirely for items whose options are a rating scale: a Likert scale
   * does not become clinical or non-clinical, only the stem does.
   */
  options?: (string | TwinOption)[];
}
