/**
 * All figures on the Findings page. Update numbers here; labels live in the
 * dictionaries (dict.findings).
 *
 * The survey and the staff interviews are different samples collected in
 * different ways. They are kept in separate objects and must never be added
 * together or turned into one rate.
 */

export const survey = {
  n: 91,

  /** Who people told about their scam call. Exclusive groups; they add up to n. */
  told: {
    noOne: 50,
    familyOnly: 27,
    officialChannel: 14,
  },
  /** Subset of `told.officialChannel`. */
  ncciaReports: 5,

  /** Respondents who reported and told us the outcome. */
  outcomes: {
    n: 17,
    solved: 0,
    acknowledgedOnly: 9,
    noResponse: 4,
    adviceOnly: 2,
    stillWaiting: 1,
    other: 1,
  },
  // REVIEW: 17 people gave an outcome, but only 14 are counted under "official
  // channel" above. The outcome question presumably also covers people who
  // reported somewhere else (for example a bank). Confirm the wording.

  /** Why people did not report. Multi-select, so these do not add up. */
  whyNot: {
    didntKnowWhere: 40,
    expectedNothing: 34,
    tooMuchEffort: 32,
    nothingLost: 26,
  },
  // REVIEW: confirm how many people answered the "why not" question.

  /** Who the caller pretended to be. Adds up to n. */
  pretended: {
    courier: 31,
    bankWallet: 22,
    familyFriend: 14,
    policeGovt: 14,
    other: 10,
  },

  /** Percentages as reported by the team. */
  // REVIEW: confirm the denominator for these percentages (all 91?).
  askedOtpPct: 60,
  askedMoneyPct: 33,
  callerKnewSomethingRealPct: 77,

  loss: {
    lostMoney: 12,
    bands: {
      under5k: 5,
      from5kTo25k: 4,
      from25kTo100k: 0,
      over100k: 3,
    },
  },

  /** Doing what the caller asked, versus not. */
  compliance: {
    complied: { n: 15, lostMoney: 11 },
    didNotComply: { n: 76, lostMoney: 1 },
  },
} as const;

export const staff = {
  /** Household and campus staff, hand-picked. Counts only, never a rate. */
  n: 14,
  lostMoney: 7,
  ncciaReports: 0,
} as const;

export const methods = {
  // REVIEW: add exact fieldwork dates and how the survey link was shared.
  surveyPeriod: 'Fall 2026',
  course: 'SS 102',
} as const;
