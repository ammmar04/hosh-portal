import type { Dictionary } from '@/i18n';
import type { TimeDict } from '@/lib/time';

/** The slice of the dictionary that report cards need. Small enough to send to the browser. */
export type ReportLabels = {
  scamTypes: Dictionary['scamTypes'];
  asked: Dictionary['asked'];
  loss: Dictionary['loss'];
  time: TimeDict;
  sample: string;
  askedFor: string;
};

export function reportLabels(dict: Dictionary): ReportLabels {
  return {
    scamTypes: dict.scamTypes,
    asked: dict.asked,
    loss: dict.loss,
    time: dict.time,
    sample: dict.common.sample,
    askedFor: dict.home.recent.askedFor,
  };
}
