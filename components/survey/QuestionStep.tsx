"use client";

import type {
  ContactAnswer,
  MultiAnswer,
  SingleAnswer,
  SurveyQuestion,
} from "@/lib/survey/types";
import { getBundledQuestion } from "@/lib/survey/questions";
import styles from "./SurveyWizard.module.css";
import { VoiceTextArea, VoiceTextInput } from "./VoiceTextField";

type Props = {
  question: SurveyQuestion;
  answers: Record<string, unknown>;
  value: unknown;
  onChange: (value: unknown) => void;
  onAnswer: (questionId: string, value: unknown) => void;
  onSubmit: (value?: unknown) => void;
};

export function QuestionStep({
  question,
  answers,
  value,
  onChange,
  onAnswer,
  onSubmit,
}: Props) {
  const bundled = getBundledQuestion(question.id);
  if (question.type === "single" && bundled?.type === "text") {
    return (
      <InviteSingleStep
        question={question}
        contactField={bundled}
        answers={answers}
        value={value as SingleAnswer | undefined}
        contactValue={answers[bundled.id] as { text?: string } | undefined}
        onChange={onChange}
        onContactChange={(v) => onAnswer(bundled.id, v)}
        onSubmit={onSubmit}
      />
    );
  }
  if (question.type === "text" && bundled?.type === "single") {
    return (
      <IncidentTextStep
        question={question}
        followUp={bundled}
        story={value as { text?: string } | undefined}
        action={answers[bundled.id] as SingleAnswer | undefined}
        onStoryChange={onChange}
        onActionChange={(v) => onAnswer(bundled.id, v)}
        onSubmit={onSubmit}
      />
    );
  }

  switch (question.type) {
    case "multi":
      return (
        <MultiStep
          question={question}
          answers={answers}
          value={value as MultiAnswer | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );
    case "single":
      return (
        <SingleStep
          question={question}
          answers={answers}
          value={value as SingleAnswer | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );
    case "text":
      return (
        <TextStep
          question={question}
          answers={answers}
          value={value as { text?: string } | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );
    case "scale":
      return (
        <ScaleStep
          question={question}
          value={value as { value?: number } | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );
    case "contact":
      return (
        <ContactStep
          value={value as ContactAnswer | undefined}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );
    default:
      return null;
  }
}

function selectedIds(
  selected: unknown,
  opts: { id: string }[],
): string[] {
  const raw = Array.isArray(selected)
    ? selected
    : typeof selected === "string" && selected
      ? [selected]
      : [];
  return raw.filter(
    (id): id is string =>
      typeof id === "string" && opts.some((option) => option.id === id),
  );
}

function MultiStep({
  question,
  answers,
  value,
  onChange,
  onSubmit,
}: {
  question: SurveyQuestion;
  answers: Record<string, unknown>;
  value?: MultiAnswer;
  onChange: (v: MultiAnswer) => void;
  onSubmit: (v?: MultiAnswer) => void;
}) {
  const opts = question.options ?? [];
  const selected = selectedIds(value?.selected, opts);
  const other = value?.other ?? "";

  const toggle = (id: string) => {
    const opt = opts.find((o) => o.id === id);
    let next: string[];
    if (opt?.exclusive) {
      next = [id];
    } else {
      const withoutExclusive = selected.filter(
        (s) => !opts.find((o) => o.id === s)?.exclusive,
      );
      if (withoutExclusive.includes(id)) {
        next = withoutExclusive.filter((s) => s !== id);
      } else {
        next = [...withoutExclusive, id];
      }
    }
    const v = { selected: next, other };
    onChange(v);
  };

  const canContinue = selected.length > 0;

  return (
    <StepShell question={question} answers={answers}>
      <ul className={styles.optionList}>
        {opts.map((o) => (
          <li key={o.id}>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={selected.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
              <span>{o.label}</span>
            </label>
          </li>
        ))}
      </ul>
      {question.otherField && selected.includes("other") && (
        <VoiceTextInput
          value={other}
          onChange={(next) => onChange({ selected, other: next })}
          placeholder="Уточните"
          voiceLabel="уточнение"
        />
      )}
      <ContinueButton
        disabled={!canContinue}
        onClick={() => onSubmit({ selected, other })}
        label={
          opts.some((o) => selected.includes(o.id) && o.endsSurvey)
            ? "Завершить опрос"
            : "Далее"
        }
      />
    </StepShell>
  );
}

function SingleStep({
  question,
  answers,
  value,
  onChange,
  onSubmit,
}: {
  question: SurveyQuestion;
  answers: Record<string, unknown>;
  value?: SingleAnswer;
  onChange: (v: SingleAnswer) => void;
  onSubmit: (v?: SingleAnswer) => void;
}) {
  const selected = value?.selected ?? "";
  const other = value?.other ?? "";

  return (
    <StepShell question={question} answers={answers}>
      <ul className={styles.optionList}>
        {(question.options ?? []).map((o) => (
          <li key={o.id}>
            <label className={styles.option}>
              <input
                type="radio"
                name={question.id}
                checked={selected === o.id}
                onChange={() => {
                  const v = { selected: o.id, other };
                  onChange(v);
                }}
              />
              <span>{o.label}</span>
            </label>
          </li>
        ))}
      </ul>
      {question.otherField && selected === "other" && (
        <VoiceTextInput
          value={other}
          onChange={(next) => onChange({ selected, other: next })}
          placeholder="Уточните"
          voiceLabel="уточнение"
        />
      )}
      <ContinueButton
        disabled={!selected}
        onClick={() => onSubmit({ selected, other })}
      />
    </StepShell>
  );
}

function TextStep({
  question,
  answers,
  value,
  onChange,
  onSubmit,
}: {
  question: SurveyQuestion;
  answers: Record<string, unknown>;
  value?: { text?: string };
  onChange: (v: { text: string }) => void;
  onSubmit: (v?: { text: string }) => void;
}) {
  const text = value?.text ?? "";

  return (
    <StepShell question={question} answers={answers}>
      <VoiceTextArea
        value={text}
        onChange={(next) => onChange({ text: next })}
        placeholder={question.placeholder}
        voiceLabel="ответ"
      />
      <ContinueButton
        disabled={!text.trim()}
        label="Отправить"
        onClick={() => onSubmit({ text: text.trim() })}
      />
    </StepShell>
  );
}

function InviteSingleStep({
  question,
  contactField,
  answers,
  value,
  contactValue,
  onChange,
  onContactChange,
  onSubmit,
}: {
  question: SurveyQuestion;
  contactField: SurveyQuestion;
  answers: Record<string, unknown>;
  value?: SingleAnswer;
  contactValue?: { text?: string };
  onChange: (v: SingleAnswer) => void;
  onContactChange: (v: { text: string }) => void;
  onSubmit: (v?: SingleAnswer) => void;
}) {
  const selected = value?.selected ?? "";
  const other = value?.other ?? "";
  const contact = contactValue?.text ?? "";
  const when = question.showBundledWhenOption ?? "yes";
  const needsContact = selected === when;

  const submit = () => {
    onChange({ selected, other });
    if (needsContact) {
      onContactChange({ text: contact.trim() });
    } else {
      onContactChange({ text: "" });
    }
    onSubmit({ selected, other });
  };

  const canContinue =
    Boolean(selected) && (!needsContact || Boolean(contact.trim()));

  return (
    <StepShell question={question} answers={answers}>
      <ul className={styles.optionList}>
        {(question.options ?? []).map((o) => (
          <li key={o.id}>
            <label className={styles.option}>
              <input
                type="radio"
                name={question.id}
                checked={selected === o.id}
                onChange={() => onChange({ selected: o.id, other })}
              />
              <span>{o.label}</span>
            </label>
          </li>
        ))}
      </ul>
      {needsContact && (
        <div className={styles.followUpBlock}>
          <p className={styles.followUpTitle}>{contactField.title}</p>
          <VoiceTextInput
            value={contact}
            onChange={(next) => onContactChange({ text: next })}
            placeholder={contactField.placeholder}
            voiceLabel="контакт"
          />
        </div>
      )}
      <ContinueButton
        disabled={!canContinue}
        label={needsContact ? "Отправить" : "Завершить опрос"}
        onClick={submit}
      />
    </StepShell>
  );
}

function IncidentTextStep({
  question,
  followUp,
  story,
  action,
  onStoryChange,
  onActionChange,
  onSubmit,
}: {
  question: SurveyQuestion;
  followUp: SurveyQuestion;
  story?: { text?: string };
  action?: SingleAnswer;
  onStoryChange: (v: { text: string }) => void;
  onActionChange: (v: SingleAnswer) => void;
  onSubmit: (v?: { text: string }) => void;
}) {
  const text = story?.text ?? "";
  const selected = action?.selected ?? "";
  const other = action?.other ?? "";

  const submit = () => {
    onStoryChange({ text: text.trim() });
    onActionChange({ selected, other });
    onSubmit({ text: text.trim() });
  };

  return (
    <StepShell question={question}>
      <VoiceTextArea
        value={text}
        onChange={(next) => onStoryChange({ text: next })}
        placeholder={question.placeholder}
        voiceLabel="ситуация"
      />

      <div className={styles.followUpBlock}>
        <h3 className={styles.followUpTitle}>{followUp.title}</h3>
        <ul className={styles.optionList}>
          {(followUp.options ?? []).map((o) => (
            <li key={o.id}>
              <label className={styles.option}>
                <input
                  type="radio"
                  name={followUp.id}
                  checked={selected === o.id}
                  onChange={() =>
                    onActionChange({ selected: o.id, other })
                  }
                />
                <span>{o.label}</span>
              </label>
            </li>
          ))}
        </ul>
        {followUp.otherField && selected === "other" && (
          <VoiceTextInput
            value={other}
            onChange={(next) =>
              onActionChange({ selected, other: next })
            }
            placeholder="Уточните"
            voiceLabel="действие"
          />
        )}
      </div>

      <ContinueButton
        disabled={!text.trim() || !selected}
        onClick={submit}
      />
    </StepShell>
  );
}

function ScaleStep({
  question,
  value,
  onChange,
  onSubmit,
}: {
  question: SurveyQuestion;
  value?: { value?: number };
  onChange: (v: { value: number }) => void;
  onSubmit: (v?: { value: number }) => void;
}) {
  const min = question.min ?? 1;
  const max = question.max ?? 5;
  const current = value?.value;
  const points: number[] = [];
  for (let i = min; i <= max; i++) points.push(i);

  return (
    <StepShell question={question}>
      <div className={styles.scaleLabels}>
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>
      <div className={styles.scaleRow}>
        {points.map((n) => (
          <button
            key={n}
            type="button"
            className={
              current === n ? styles.scaleBtnActive : styles.scaleBtn
            }
            onClick={() => onChange({ value: n })}
          >
            {n}
          </button>
        ))}
      </div>
      <ContinueButton
        disabled={current === undefined}
        onClick={() => current !== undefined && onSubmit({ value: current })}
      />
    </StepShell>
  );
}

function ContactStep({
  value,
  onChange,
  onSubmit,
}: {
  value?: ContactAnswer;
  onChange: (v: ContactAnswer) => void;
  onSubmit: (v?: ContactAnswer) => void;
}) {
  const telegram = value?.telegram ?? "";
  const email = value?.email ?? "";
  const ok = telegram.trim() || email.trim();

  return (
    <>
      <h2 className={styles.title}>Как с вами связаться?</h2>
      <p className={styles.desc}>Укажите Telegram или email — что удобнее</p>
      <label className={styles.fieldLabel}>
        Telegram
        <VoiceTextInput
          value={telegram}
          onChange={(next) => onChange({ telegram: next, email })}
          placeholder="@username"
          voiceLabel="Telegram"
        />
      </label>
      <label className={styles.fieldLabel}>
        Email
        <VoiceTextInput
          value={email}
          onChange={(next) => onChange({ telegram, email: next })}
          placeholder="you@example.com"
          type="email"
          voiceLabel="email"
        />
      </label>
      <ContinueButton
        disabled={!ok}
        label="Завершить"
        onClick={() =>
          onSubmit({
            telegram: telegram.trim(),
            email: email.trim(),
          })
        }
      />
    </>
  );
}

function StepShell({
  question,
  answers,
  children,
}: {
  question: SurveyQuestion;
  answers?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const a = answers ?? {};
  const title = question.resolveTitle?.(a) ?? question.title;
  const description =
    question.resolveDescription?.(a) ?? question.description;
  const paragraphs =
    description?.split(/\n\n/).map((part) => part.trim()).filter(Boolean) ??
    [];
  const scenario = question.section === "scenario";

  return (
    <>
      {scenario &&
        paragraphs.map((part) => (
          <p className={styles.desc} key={part}>
            {part}
          </p>
        ))}
      <h2 className={styles.title}>{title}</h2>
      {!scenario && description && paragraphs.length <= 1 && (
        <p className={styles.desc}>{description}</p>
      )}
      {!scenario && description && paragraphs.length > 1 && (
        paragraphs.map((part) => (
          <p className={styles.desc} key={part}>
            {part}
          </p>
        ))
      )}
      {children}
    </>
  );
}

function ContinueButton({
  disabled,
  onClick,
  label = "Далее",
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={styles.primaryBtn}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
