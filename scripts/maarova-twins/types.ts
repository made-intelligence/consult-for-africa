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
   * Omit for items whose options are a rating scale rather than mapped
   * choices. The seeder then copies the original's options, because a Likert
   * scale does not become clinical or non-clinical, only the stem does.
   */
  options?: TwinOption[];
}
