export type QuestionType =
  | "multi"
  | "single"
  | "text"
  | "scale"
  | "contact";

export type SurveyOption = {
  id: string;
  label: string;
  exclusive?: boolean;
  endsSurvey?: boolean;
};

export type SurveyQuestion = {
  id: string;
  section?: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: SurveyOption[];
  otherField?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
  /** Не отдельный шаг — показывается вместе с вопросом bundleWith */
  bundleWith?: string;
  /** Для single: при выборе этой опции показывается связанное text-поле (bundleWith) */
  showBundledWhenOption?: string;
  /** Skip unless predicate on answers returns true */
  showIf?: (answers: Record<string, unknown>) => boolean;
  resolveTitle?: (answers: Record<string, unknown>) => string;
  resolveDescription?: (answers: Record<string, unknown>) => string | undefined;
};

export type SurveyAnswers = Record<string, unknown>;

export type MultiAnswer = {
  selected: string[];
  other?: string;
};

export type SingleAnswer = {
  selected: string;
  other?: string;
};

export type ContactAnswer = {
  telegram?: string;
  email?: string;
};
